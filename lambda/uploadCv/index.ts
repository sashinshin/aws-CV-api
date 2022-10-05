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
        const file = event.body;
        console.log(file);
        
        let params: any = {}

        if (event.fileFormat === "image") {
            const regex = /^data:image\/\w+;base64,/;
        
            const decodedFile = Buffer.from(file.replace(regex, ""), "base64");
            
            params = {
                Body: decodedFile,
                Bucket: getEnvVar("BUCKET_NAME"),
                Key: `${Date.now().toString()}.jpg`,
                ContentType: "image/jpeg",
            };
        } else {

            const regex = /^data:application\/pdf\/\w+;base64,/;
            
            const decodedFile = Buffer.from(file.replace(regex, ""), "base64");
            
            params = {
                Body: decodedFile,
                Bucket: getEnvVar("BUCKET_NAME"),
                Key: `${Date.now().toString()}.pdf`,
                ContentType: "application/pdf",
            };
        }

        const res = await s3.upload(params).promise();

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