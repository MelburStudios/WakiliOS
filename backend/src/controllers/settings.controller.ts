//@ts-nocheck
import Settings from "../models/settings.model";
import Currency from "../models/currency.model";
import fs from "fs";
import path from "path";
import { s3DeleteFiles, s3UploadFile, s3UploadFiles } from "../utils/s3";
import { seedAdmin } from "../.../../seeds/seed";
import mongoose from "mongoose";


// get site settings
export const getSiteSettings = async (req, res) => {
    try {
        const currency = await Currency.findOne({ default: true }, 'symbol');
        const data = await Settings.findOne({}, 'title description logo dark_logo footer_text email phone address facebook twitter instagram linkedin youtube ai_key')

        const responseData = {
            ...data.toObject(),
            currency: currency ? currency.symbol : null
        };

        return res.status(200).send({
            error: false,
            msg: 'Site settings fetched successfully',
            data: responseData
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Internal server error'
        })
    }
}

// get setting
export const getSettings = async (req, res) => {
    try {
        const data = await Settings.findOne({});
        const currency = await Currency.findOne({ default: true }, 'symbol');
        const responseData = {
            ...data.toObject(),
            currency: currency ? currency.symbol : null
        };

        return res.status(200).send({
            error: false,
            msg: 'Settings fetched successfully',
            data: responseData
        });
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Internal server error'
        });
    }
};

// update settings
export const postSettings = async (req, res) => {
    try {
        const { body, files } = req
        const settingData = await Settings.findById(body?._id)
        console.log("🚀 ~ postSettings ~ body:", body)
        if (!!files?.logo) {
            if (!!settingData?.logo) {
                await s3DeleteFiles([settingData?.logo])
            }
            // body["logo"] = await s3UploadFiles(files.logo, `settings/logo`)
        }


        await Settings.updateOne({}, body, {
            upsert: true
        })
        return res.status(200).send({
            error: false,
            msg: 'Settings updated successfully',
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Internal server error'
        })
    }
}


export const postSettingEnvBYAdmin = async (req, res) => {
    console.log("🚀 ~ postSettingEnvBYAdmin ~ req:", req.body)
    try {
        const { adminInfo, valueString } = req.body;
        const valueENV: any = Object.entries(valueString)
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");
        const envValues = valueENV + "\n" + `BCRYPT_SALT_ROUNDS=10` + "\n" + `PORT=2025` + "\n" + `JWT_ACCESS_SECRET=eiuwrhweiwerijweweiorjwei` + "\n" + `JWT_ACCESS_EXPIRES_IN="30d"` + "\n" + `JWT_REFRESH_SECRET=qweoiurhiweurh` + "\n" + `JWT_REFRESH_EXPIRES_IN="30d"`;

        if (adminInfo?.password !== adminInfo?.confirmPassword) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Request Failed",
                "Password invalid"
            )
        }
        // Check if Mongoose is already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(valueString.MONGODB_URI);
            console.log("Connected to MongoDB");
        }
        await seedAdmin(adminInfo)
        const file = path.join(__dirname, `../../.env`);
        fs.writeFileSync(file, envValues);

        return res.status(200).send({
            error: false,
            msg: 'Settings env get successfully',
            data: {
                status: true,
                env: true
            }
        });
    } catch (error) {
        console.log(error);
    }

};

export const checkSettingEnv = async (req, res) => {
    try {

        const envFilePath = path.resolve(".env");
        const exist = fs.existsSync(envFilePath);

        if (!exist) {
            return res.status(200).send({
                error: false,
                msg: 'Settings env get successfully',
                data: {
                    status: true,
                    env: false
                }
            });
        }

        return res.status(200).send({
            error: false,
            msg: 'Settings env get successfully',
            data: {
                status: true,
                env: true
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: true,
            msg: 'Internal server error'
        })
    }

}
