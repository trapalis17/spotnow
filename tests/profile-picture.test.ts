import assert from 'node:assert/strict';
import {test} from 'node:test';
import {VIBE_AVATARS,avatarById,defaultAvatarId,isProfilePicture,photoFromBase64} from '../lib/profile-picture';

test('Spotnow includes exactly eight distinct 3D avatars: four men and four women',()=>{
 assert.equal(VIBE_AVATARS.length,8);
 assert.equal(new Set(VIBE_AVATARS.map(a=>a.id)).size,8);
 assert.equal(new Set(VIBE_AVATARS.map(a=>a.label)).size,8);
 assert.deepEqual(VIBE_AVATARS.map(a=>[a.row,a.col]),[
  [0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3]
 ]);
});
test('Default profile avatar is deterministic and account-specific',()=>{
 assert.equal(defaultAvatarId('DEMO@EXAMPLE.COM'),defaultAvatarId('demo@example.com'));
 assert.ok(VIBE_AVATARS.some(a=>a.id===defaultAvatarId('someone@vibe.com')));
});
test('Profile photo validates JPEG data URIs and rejects remote URLs',()=>{
 assert.deepEqual(photoFromBase64('YWJj'),{kind:'photo',uri:'data:image/jpeg;base64,YWJj'});
 assert.equal(isProfilePicture({kind:'photo',uri:'https://example.com/photo.jpg'}),false);
 assert.equal(isProfilePicture({kind:'avatar',id:'unknown'}),false);
 assert.equal(avatarById('invalid').id,VIBE_AVATARS[0].id);
});
