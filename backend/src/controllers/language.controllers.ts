//@ts-nocheck
import { Request, Response } from "express";
import { Language } from "../models/language.model";
import { ApiResponse } from "../utils/response.util";
import { Settings } from "../models/settings.model";
import Groq from "groq-sdk";

export const getLanguages = async (req: Request, res: Response) => {
    try {
        const data = await Language.find({ active: true }, 'name code flag active default rtl');
        return ApiResponse.success(res, "Languages", data);
    } catch (e) {
        return ApiResponse.error(res, "Internal Server Error");
    }
};

export const getLanguageList = async (req, res) => {
    try {
        const { query } = req;

        let filter: any = {};
        if (query.active !== undefined) {
            filter.active = query.active === 'true';
        }
        if(!!query.search){
            filter['name'] = { $regex: new RegExp(query.search.toLowerCase(), "i") }
        }
        let data = await Language.paginate(
            filter,
            {
                page: query.page || 1,
                limit: query.limit || 10,
                sort: { createdAt: -1 },
                select: "-translations"
            }
        );

        return res.status(200).send({
            error: false,
            msg: "Language list",
            data,
        });
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: "Internal Server Error"
        });
    }
};

export const getLanguage = async (req: Request, res: Response) => {
    try {
        const { query } = req;
        const filter = { _id: query._id };
        const data = await Language.findOne(filter, 'name code flag active rtl');
        if (!data) {
            return ApiResponse.error(res, "Language not found");
        }
        return ApiResponse.success(res, "Language", data);
    } catch (e) {
        return ApiResponse.error(res, "Internal Server Error");
    }
};

export const postLanguage = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        if (body._id) {
            const find = await Language.findOne({ _id: body._id });
            if (!find) {
                return ApiResponse.error(res, "Language not found");
            }
            if (body.name) find.name = body.name;
            if (body.code) find.code = body.code;
            if (body.flag) find.flag = body.flag;
            if (body.translations) find.translations = body.translations;
            if (typeof body.rtl === "boolean") find.rtl = body.rtl;

            if (typeof body.default !== 'undefined') {
                if (body.default && !find.default) {
                    await Language.updateMany({}, { default: false });
                } else if (find.default && !body.default) {
                    return ApiResponse.error(res, "At least one language must be default");
                }
            }
            if (typeof body.default === "boolean") find.default = body.default;
            await find.save();
            return ApiResponse.success(res, "Language updated successfully");
        }
        const data = await Language.create(body);
        return ApiResponse.success(res, "Language created successfully", data);
    } catch (e: any) {
        if (e.code === 11000) {
            return ApiResponse.error(res, "Language already exists");
        }
        return ApiResponse.error(res, "Internal Server Error");
    }
};


export const getLanguageTranslations = async (req: Request, res: Response) => {
    try {
        const { query } = req;
        if (!query._id) {
            const allTranslationsData = await Language.find({}, 'name code flag default translations');
            return ApiResponse.success(res, "Language translations", allTranslationsData);
        }
        const data = await Language.findOne({ _id: query._id }, 'name code flag default translations');
        if (!data) {
            return ApiResponse.error(res, "Language not found");
        }
        return ApiResponse.success(res, "Language translations", data);
    } catch (e) {
        return ApiResponse.error(res, "Internal Server Error");
    }
};

export const deleteLanguage = async (req: Request, res: Response) => {
    try {
        const { query } = req;
        const data = await Language.findOneAndDelete({ _id: query._id });
        if (!data) {
            return ApiResponse.error(res, "Language not found or already deleted");
        }
        return ApiResponse.success(res, "Language deleted successfully");
    } catch (e) {
        return ApiResponse.error(res, "Internal Server Error");
    }
};


export const translateLanguage = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const langCode = body.langCode;
        const settings = await Settings.findOne({}, 'ai_key');
        const groq = new Groq({ apiKey: settings.ai_key });
        const translatedBody = {};
        for (const [key, value] of Object.entries(body)) {
            if (key !== 'langCode') {
                const prompt = `Translate only the given text to ${langCode} without any explanation: "${value}"`;
                const response = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    model: "llama3-8b-8192",
                });

                let translatedText = response.choices[0].message.content;

                translatedText = translatedText.replace(/\(.*?\)/g, '').trim();

                translatedBody[key] = translatedText;
            }
        }

        return res.status(200).send({
            error: false,
            msg: "Successfully translated content",
            data: translatedBody,
        });

    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: "Internal Server Error"
        });
    }
};

export const getPublicLanguageList = async (req: Request, res: Response) => {
    try {
        const { query } = req;
        const data = await Language.paginate({}, {
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
            sort: { createdAt: -1 },
            select: "-translations"
        });
        return ApiResponse.success(res, "Language list", data);
    } catch (e) {
        return ApiResponse.error(res, "Internal Server Error");
    }
};

export const changeDefaultStatus = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const find = await Language.findOne({ _id: body._id });
        if (!find) {
            return ApiResponse.error(res, "Language not found");
        }
        await Language.updateMany({}, { default: false });
        find.default = true;
        await find.save();
        return ApiResponse.success(res, "Default language changed successfully");
    } catch (e) {
        return ApiResponse.error(res, "Internal Server Error");
    }
};
