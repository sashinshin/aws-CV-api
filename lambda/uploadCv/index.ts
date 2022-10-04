import { S3 } from "aws-sdk";

const s3 = new S3();

export const getEnvVar = (input: string) => {
    const value = process.env[input];
    if (typeof value === "string") {
        return value;
    }
    throw new Error(`process.env.${input} was not set`);
};

export const handler = async (event: any) => {
    console.log("Input event:");
    console.log(event);


    try {
        const s3Upload = s3.upload({
            Body: event.body,
            Bucket: getEnvVar("BUCKET_NAME"),
            Key: `${Date.now().toString()}.pdf`,
        });

        const res = await s3Upload.promise();

        return {
            statusCode: 200,
            body: JSON.stringify(res),
            isBase64Encoded: false,
            headers: {
                'Access-Control-Allow-Method': "POST",
                'Access-Control-Allow-Origin': "*"
            }
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error),
            isBase64Encoded: false,
            headers: {
                'Access-Control-Allow-Method': "POST",
                'Access-Control-Allow-Origin': "*"
            }
        };
    }
};