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
        const parsedBody = JSON.parse(event.body);
        console.log(parsedBody);
        
        const base64File = parsedBody.file;
        const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");
        console.log(decodedFile);
        

        const params = {
            Body: decodedFile,
            Bucket: getEnvVar("BUCKET_NAME"),
            Key: `${Date.now().toString()}.pdf`,
        };

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