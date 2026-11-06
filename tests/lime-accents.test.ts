import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Colors} from '../constants/theme';

function luminance(hex:string):number{
 const numbers=hex.replace('#','').match(/.{2}/g)!.map(x=>parseInt(x,16)/255)
  .map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4));
 return numbers[0]*.2126+numbers[1]*.7152+numbers[2]*.0722;
}
function contrast(a:string,b:string){
 const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
test('spotnow uses electric lime as a limited accent while preserving violet branding',()=>{
 assert.equal(Colors.limeAccent,'#C9FF62');
 assert.equal(Colors.limeSoft,Colors.limeAccent);
 assert.equal(Colors.background,'#FAF8FF');
 assert.equal(Colors.violet,'#5B47D6');
});
test('dark ink on electric lime satisfies WCAG AA normal text contrast',()=>{
 assert.ok(contrast(Colors.limeInk,Colors.limeAccent)>=4.5);
});
