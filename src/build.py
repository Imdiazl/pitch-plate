#!/usr/bin/env python3
"""Builds app.html (artifact body) and index.html (PWA) from src/template.html + src/keep.json."""
import json,re,os
here=os.path.dirname(os.path.abspath(__file__)); root=os.path.dirname(here)
keep=json.load(open(os.path.join(here,'keep.json')))
t=open(os.path.join(here,'template.html')).read()
c=keep['coach']
c=re.sub(r"const sys=COACH_SYSTEM\+'[^']*'\+coachContext\(\);", "const sys=COACH_SYSTEM+'\\\\n\\\\n'+coachContext()+'\\\\n\\\\n'+proteinPriceContext();", c, count=1)
assert 'proteinPriceContext' in c
c=re.sub(r"\ngetSample\(\);\n","\n",c)
keep['coach']=c
if 'Kippendijfilet' not in keep['staples']:
    keep['staples']=keep['staples'].replace("['Kipfilet gegaard (cooked chicken breast)',165,31,0,3.6,0,0],","['Kipfilet gegaard (cooked chicken breast)',165,31,0,3.6,0,0],['Kippendijfilet (chicken thigh), raw',121,18,0,5.5,0,0],")
g=keep['game']
old=g[g.index('function weeklyChallenge'):g.index('\nconst BADGES=')]
new="function weeklyChallenge(){const w=weekOf(ymd(new Date()));const lw=weekOf(addDays(w[0],-7));const hadLast=lw.some(d=>S.days[d]&&S.days[d].foods.length);const wk=Math.floor((parseYmd(w[0])-new Date(2026,0,5))/(7*864e5));let c;if(hadLast){c=[...CHALLENGES].map((x,i)=>({x,r:x.count(lw)/x.goal,i})).sort((a,b)=>a.r-b.r||((a.i+wk)%5)-((b.i+wk)%5))[0].x}else c=CHALLENGES[((wk%CHALLENGES.length)+CHALLENGES.length)%CHALLENGES.length];const n=c.count(w);return{...c,n:Math.min(n,c.goal),done:n>=c.goal,personal:hadLast}}"
g=g.replace(old,new)
ds0=g.index('function dayScore(d){'); ds1=g.index('\n}',ds0)+2
g=g[:ds0]+"function dayScore(d){const D=S.days[d];if(!D||!D.foods.length)return null;return clamp(scoreParts(d).reduce((a,x)=>a+x.earned,0),0,100)}\n"+g[ds1:]
keep['game']=g
for k,v in keep.items(): t=t.replace('{{'+k+'}}',v)
assert not re.search(r'\{\{(staples|maths|search|gcal|coach|game|scanner|exercise)\}\}',t)
open(os.path.join(root,'app.html'),'w').write(t)
i=t.index('</style>')+len('</style>'); head_part,body_part=t[:i],t[i:]
head=open(os.path.join(here,'head.html')).read()
sw_reg="\n<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}</script>\n</head>\n<body>"
open(os.path.join(root,'index.html'),'w').write(head+head_part+sw_reg+body_part+'\n</body>\n</html>\n')
print('built app.html + index.html', len(t))
