import jimp from 'jimp';
import { createClient } from '@supabase/supabase-js';

const s = createClient('https://vdzrazmmkszrpanupgog.supabase.co', 'sb_publishable_n-S4aCP56aILrzZioj-R4g_diKo5PeX');

async function run() {
    try {
        console.log("Reading image...");
        const image = await jimp.read('../frontend/public/Images/logo.png.png');
        console.log("Resizing...");
        image.resize(150, jimp.AUTO); // Resize to 150px wide to save space
        
        console.log("Encoding base64...");
        const base64Str = await image.getBase64Async(jimp.MIME_PNG);
        console.log(`Base64 length: ${base64Str.length} bytes`);
        
        console.log("Updating Supabase system_settings...");
        const { error } = await s.from('system_settings').update({setting_value: base64Str}).eq('setting_key', 'contact_logo');
        if (error) {
            console.error('Update Error:', error);
        } else {
            console.log('Logo successfully updated in database as base64 inline image!');
        }
    } catch(e) {
        console.error(e);
    }
}

run();
