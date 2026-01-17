const { createClient } = require('redis');

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function startRedis() {
    try {
        if (!client.isOpen) {
            await client.connect();
            console.log("✅ Terhubung ke Redis!");
        }
    } catch (err) {
        console.error("❌ Gagal connect ke Redis:", err);
        // process.exit(1);
    }
}

const getAllData = async () => {
    try {
        const keys = await client.keys("otp:*");

        if (keys.length === 0) {
            return [];
        }

        const [values, ttls] = await Promise.all([
            client.mGet(keys),
            Promise.all(keys.map(key => client.ttl(key)))
        ]);

        const data = keys.map((key, index) => {
            return {
                key: key.replace("otp:", ""),
                otp: values[index],
                exp: ttls[index]
            };
        });

        return data;

    } catch (error) {
        console.error("Gagal mengambil data Redis:", error);
        throw error;
    }
}

const createOtp = async (phoneNumber, otpCode) => {
    if (!client.isOpen) await startRedis();

    const key = `otp:${phoneNumber}`;
    const ttlInSeconds = 300000;

    try {
        await client.set(key, otpCode, { EX: ttlInSeconds });
        console.log(`OTP disimpan untuk ${phoneNumber}, expired dalam 5 menit.`);
        return true;
    } catch (error) {
        console.error("Gagal simpan ke Redis:", error);
        return false;
    }
}

const verifyOtp = async (phoneNumber, inputCode) => {
    if (!client.isOpen) await startRedis();
    
    const key = phoneNumber;

    try {
        const storedCode = await client.get(key);

        if (!storedCode) {
            return { success: false, message: "Kode OTP sudah kadaluwarsa atau tidak valid." };
        }

        if (storedCode === inputCode) {
            await client.del(key); 
            return { success: true, message: "Verifikasi Berhasil!" };
        } else {
            return { success: false, message: "Kode OTP salah." };
        }

    } catch (error) {
        console.error("Error verifikasi:", error);
        return { success: false, message: "Terjadi kesalahan sistem." };
    }
}

module.exports = { startRedis, getAllData, createOtp, verifyOtp };