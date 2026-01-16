"use client";

import { useI18n } from "@/app/providers/i18n";
import { Card } from "antd";

const PageTitle = ({ title }) => {
    const i18n = useI18n()

    return (
        <Card className=" mb-4 ">
            <h1 className="text-xl !text-primary !font-work capitalize font-semibold">{(i18n?.t(title))}</h1>
        </Card>
    )
}

export default PageTitle