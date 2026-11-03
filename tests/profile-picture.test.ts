import assert from 'node:assert/strict';
import {test} from 'node:test';
import {VIBE_AVATARS,avatarById,defaultAvatarId,isProfilePicture,photoFromBase64} from '../lib/profile-picture';

test('Vibe includes exactly 12 distinct handcrafted avatar presets',()=>{
 assert.equal(VIBE_AVATARS.length,12);
 assert.equal(new Set(VIBE_AVATARS.map(a=>a.id)).size,12);
 assert.ok(VIBE_AVATARS.every(a=>a.icon&&a.colors.length===2));
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
