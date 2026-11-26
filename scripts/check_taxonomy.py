#!/usr/bin/env python3
"""Check canonical presentation labels without modifying records or model outputs."""
from pathlib import Path
import argparse,csv,html,json,re,shutil,subprocess,sys

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--pdf',action='store_true',help='Also inspect tracked PDF figure text with pdftotext.');args=parser.parse_args()
 root=Path(__file__).resolve().parents[1]
 registry=json.loads((root/'taxonomy.json').read_text());parents=registry['level1'];items=registry['level2'];labels=[item['label'] for item in items];parent={item['label']:item['level1'] for item in items};errors=[];checked=0;pdf_count=0
 def require(ok,message):
  if not ok:errors.append(message)
 require(len(parents)==3 and len(set(parents))==3,'Expected three unique Level-1 labels.')
 require(len(labels)==10 and len(set(labels))==10,'Expected ten unique Level-2 labels.')
 require(all(p in parents for p in parent.values()),'Unknown Level-1 parent in registry.')
 require(all(v in labels for v in registry['legacy_display_aliases'].values()),'Alias target is not canonical.')
 require(set(registry['figure_abbreviations'].values())==set(labels),'Figure abbreviations must cover the ten final labels.')
 forbidden=list(registry['legacy_display_aliases'])+['missing objective or loss','ambiguous model structure','ambiguous method behavior','inconsistent architecture or pipeline']
 def normalize(text):
  text=html.unescape(text).replace('\u00a0',' ')
  text=re.sub(r'(?<=\w)-\s*\n\s*(?=\w)','',text)
  text=re.sub(r'\\(?:newline|linebreak)\b',' ',text)
  return re.sub(r'\s+',' ',text)
 def inspect(text,name):
  normalized=normalize(text).lower()
  for old in forbidden:
   require(old not in normalized,f'{name}: legacy display label {old!r}')
  for label in re.findall(r'\\catname\{([^}]+)\}',text):require(label in labels or label=='#1',f'{name}: noncanonical catname {label!r}')
 for p in sorted(root.rglob('*')):
  if not p.is_file() or any(part in {'.git','node_modules','__pycache__','build','output'} for part in p.relative_to(root).parts):continue
  rel=p.relative_to(root).as_posix()
  if rel.startswith('scripts/') or p.name in {'taxonomy.json','TAXONOMY.md'}:continue
  if p.suffix in {'.tex','.html','.js','.svg','.md','.json','.csv','.vtt'}:
   inspect(p.read_text(),rel);checked+=1
  elif args.pdf and p.suffix=='.pdf':
   if not shutil.which('pdftotext'):raise SystemExit('--pdf requires pdftotext (Poppler).')
   text=subprocess.check_output(['pdftotext','-layout',str(p),'-'],text=True);inspect(text,rel);pdf_count+=1
   if p.name=='construct_taxonomy.pdf':
    require('XXX' not in text,f'{rel}: unresolved taxonomy placeholder')
    require('Conflicting Formal Definition' in normalize(text),f'{rel}: expected canonical example missing')
   if p.name=='teaser_task_setting.pdf':require('L2 Ambiguous Definition' in normalize(text),f'{rel}: activated-parameter teaser label differs from active teaser')
 # The final table and detailed definitions must contain the complete canonical set.
 for name in ['appendix/construct_taxonomy.tex','sec/B_taxonomy.tex']:
  p=root/name
  if p.exists():
   text=p.read_text();table=text.split('\\begin{table*}',1)[1].split('\\end{table*}',1)[0]
   actual=re.findall(r'^\s*&\s*([^\\\n]+?)\s*$',table,re.M)
   require(actual==labels,f'{name}: final taxonomy table differs from registry')
   headings=re.findall(r'\\paragraph\{\\catname\{([^}]+)\}',text)
   require(headings==labels,f'{name}: detailed category headings differ from registry')
   cases=root/('appendix/data_analysis.tex' if name.startswith('appendix') else 'sec/A_data_analysis.tex');c=cases.read_text()
   require('Incompleteness / Missing Model Structure' in c and 'Ambiguity / Ambiguous Definition' in c,f'{cases.name}: Case B categories are not canonical')
   require('Taxonomy names are normalized' in c,f'{cases.name}: display normalization must be disclosed')
 data=root/'data';records=0
 if (data/'examples.json').exists():
  for row in json.loads((data/'examples.json').read_text()):
   require(row['category'] in labels and parent.get(row['category'])==row['type'],f"Example {row['id']}: invalid category or parent");records+=1
 if (data/'distributions.json').exists():
  d=json.loads((data/'distributions.json').read_text());require([c['label'] for c in d['dimensions']['level2']['categories']]==labels,'Distribution categories differ from registry');require([c['label'] for c in d['dimensions']['level1']['categories']]==parents,'Distribution types differ from registry')
 if (data/'distribution-audit.csv').exists():
  with (data/'distribution-audit.csv').open() as f:
   for row in csv.DictReader(f):require(parent.get(row['level2'])==row['level1'],f"Audit row {row['id']}: invalid category or parent");records+=1
 if (root/'index.html').exists():
  text=(root/'index.html').read_text()
  for label in labels:require(label in text,f'Website taxonomy missing {label!r}')
 if errors:
  print('\n'.join(errors),file=sys.stderr);raise SystemExit(1)
 print(f'PASS: 3 Level-1 / 10 Level-2 labels; {checked} text files, {pdf_count} PDFs, {records} data records checked. Raw IDs, slots, source quotations, and scores are not rewritten.')
if __name__=='__main__':main()
