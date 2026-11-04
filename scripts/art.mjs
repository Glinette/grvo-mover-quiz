import { mkdir, writeFile } from 'node:fs/promises';
export function character(type) {
  const planner = type === 'planner', last = type === 'lastminute', heart = type === 'sentimental', chill = type === 'chill';
  const color = planner ? '#c9ee83' : last ? '#efae75' : heart ? '#d9bdd9' : '#8cc9bd';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 280" fill="none">
    <ellipse cx="132" cy="253" rx="79" ry="10" fill="#173f35" opacity=".09"/>
    <g stroke="#173f35" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M103 205l-7 32-20 5m80-37 9 32 22 4"/>
    <path d="M65 135Q30 146 34 ${last ? '106' : '180'}m157-42q35 5 31 ${chill ? '101' : '177'}"/>
    <path d="M60 88l112-18 34 35-8 100-117 12-25-34z" fill="${color}"/>
    <path d="M60 88l26 36 120-19M86 124l-5 93m91-147-6 35"/>
    <path d="M105 81l26 36 21-3-26-36" fill="#fbf8ed" stroke="none"/>
    <path d="M131 117v25l9-6 10 5 2-27" fill="#fbf8ed" stroke="none"/>
    ${chill ? '<path d="m101 151 35-3 1 15q-19 12-33-2zm41-4 35-3-2 17q-18 12-31-1z" fill="#173f35"/><path d="m136 153 7-1"/>' : '<path d="M111 156v7m53-13v7"/>'}
    ${last ? '<ellipse cx="140" cy="180" rx="8" ry="10" fill="#fbf8ed"/><path d="M172 129q12-24 14-2c0 8-12 9-14 2" fill="#fbf8ed" stroke-width="3"/><path d="m43 53 6 17m-24-2 14 9m163-20 14-12" stroke-width="4"/>' : '<path d="M125 179q13 13 26-3"/>'}
    ${heart ? '<path d="M101 197c-35-11-53-33-34-47 12-9 23 2 24 7 4-10 17-15 25-5 11 14-3 33-15 45z" fill="#fbf8ed"/><path d="m64 175 22 11m112-15-26 17"/><path d="M208 54c-17-7-22-19-11-23 6-2 10 3 11 7 4-9 13-7 15-1 3 7-6 14-15 17z" fill="#d9bdd9" stroke-width="3"/>' : ''}
    ${planner ? '<path d="m188 148 34 8-12 57-36-9z" fill="#fbf8ed"/><path d="m198 148 14 3-2 9-14-3z" fill="#173f35" stroke-width="3"/><path d="m186 176 3 4 6-7m-12 18 3 3 6-6m7-9 10 2m-14 11 11 2" stroke-width="3"/><path d="m61 64 8 7 15-19"/>' : ''}
    ${chill ? '<path d="m202 90 29 3-5 33-20-2z" fill="#fbf8ed"/><path d="m218 93 7-23 12-4" stroke-width="3"/><path d="m61 53 5-11m-23 18-11-3m35 8 14 2" stroke-width="3"/>' : ''}
    ${last ? '<path d="m22 98 29-8 3 22-29 8z" fill="#fbf8ed"/><path d="M26 96v-7m24 1v-7" stroke-width="3"/><path d="m30 105 15-4" stroke-width="3"/>' : ''}
    </g></svg>`;
}
export async function makeArt() {
  await mkdir('public/assets', {recursive:true});
  for (const type of ['planner','lastminute','sentimental','chill']) await writeFile(`public/assets/${type}.svg`, character(type));
  await writeFile('public/assets/favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#173f35"/><path d="M45 23a17 17 0 1 0 2 21V32H31v8h8a9 9 0 1 1 0-12z" fill="#c9f581"/></svg>');
  await writeFile('public/assets/social-preview.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f7f7ed"/><circle cx="980" cy="300" r="330" fill="#e2ead6"/><text x="65" y="83" fill="#173f35" font-family="Arial,sans-serif" font-weight="900" font-size="42">GRVO<tspan fill="#76a641">↗</tspan></text><text x="65" y="173" fill="#53705b" font-family="Arial,sans-serif" font-size="18" letter-spacing="4">A LITTLE SELF-DISCOVERY. A LOT OF BOXES.</text><g font-family="Arial,sans-serif" font-weight="900" font-size="78" fill="#173f35"><text x="60" y="278">What type of</text><text x="60" y="364">mover are you?</text></g><rect x="65" y="425" width="440" height="70" rx="35" fill="#c9f581"/><text x="95" y="471" fill="#173f35" font-family="Arial,sans-serif" font-size="26" font-weight="700">Find my moving personality ↗</text><text x="65" y="556" fill="#53705b" font-family="Arial,sans-serif" font-size="22">5 questions · 60 seconds · No signup</text>${[['planner',705,12],['chill',945,80],['sentimental',690,290],['lastminute',930,345]].map(([type,x,y])=>`<g fill="none" transform="translate(${x} ${y}) scale(.87)">${character(type).replace(/<svg[^>]*>|<\/svg>/g,'')}</g>`).join('')}</svg>`);
}
if (process.argv[1]?.endsWith('art.mjs')) await makeArt();
