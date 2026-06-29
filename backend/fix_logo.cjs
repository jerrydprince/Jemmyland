const { Jimp } = require('jimp');
const { createClient } = require('@supabase/supabase-js');

const s = createClient('https://vdzrazmmkszrpanupgog.supabase.co', 'sb_publishable_n-S4aCP56aILrzZioj-R4g_diKo5PeX');

async function run() {
    try {
        console.log("Reading image...");
        const image = await Jimp.read('../frontend/public/Images/logo.png.png');
        console.log("Resizing...");
        image.resize({ w: 150 });
        
        console.log("Encoding base64...");
        const base64Str = await image.getBase64Async('image/png');
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
