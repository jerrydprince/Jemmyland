import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const s = createClient('https://vdzrazmmkszrpanupgog.supabase.co', 'sb_publishable_n-S4aCP56aILrzZioj-R4g_diKo5PeX');

async function run() {
    try {
        const fileBuffer = fs.readFileSync('public/Images/logo.png.png');
        
        console.log("Uploading...");
        const { data, error } = await s.storage.from('gallery_images').upload('public/jemmyland_logo.png', fileBuffer, {
            contentType: 'image/png',
            upsert: true
        });
        
        if (error) {
            console.error('Upload Error:', error);
            
            // Try another bucket if gallery_images doesn't exist or is restricted
            console.log("Trying 'avatars' bucket...");
            const res2 = await s.storage.from('avatars').upload('jemmyland_logo.png', fileBuffer, { contentType: 'image/png', upsert: true });
            if (res2.error) {
                console.log("Trying 'images' bucket...");
                const res3 = await s.storage.from('images').upload('jemmyland_logo.png', fileBuffer, { contentType: 'image/png', upsert: true });
                if (res3.error) {
                    console.error("All uploads failed.");
                    return;
                } else {
                    updateSettings(s.storage.from('images').getPublicUrl('jemmyland_logo.png').data.publicUrl);
                }
            } else {
                updateSettings(s.storage.from('avatars').getPublicUrl('jemmyland_logo.png').data.publicUrl);
            }
        } else {
            updateSettings(s.storage.from('gallery_images').getPublicUrl('public/jemmyland_logo.png').data.publicUrl);
        }
    } catch(e) {
        console.error("Exception:", e);
    }
}

async function updateSettings(publicUrl) {
    console.log('Public URL:', publicUrl);
    const { error } = await s.from('system_settings').update({setting_value: publicUrl}).eq('setting_key', 'contact_logo');
    console.log('Update Error:', error || 'Success!');
}

run();
