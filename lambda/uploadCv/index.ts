import { S3 } from "aws-sdk";

const s3 = new S3();

const getEnvVar = (input: string) => {
    const value = process.env[input];
    if (typeof value === "string") {
        return value;
    }
    throw new Error(`process.env.${input} was not set`);
};

export const handler = async (event: any) => {
    try {
        console.log("Headers:");
        console.log(event.headers);
        const file = event.body;
        const regex = /^data:application\/\w+;base64,/;
        console.log("Regex test:");
        console.log(regex.test(file));
        const decodedFile = Buffer.from(file.replace(regex, ""), "base64");

        const params = {
            Body: decodedFile,
            Bucket: getEnvVar("BUCKET_NAME"),
            Key: `cv/${Date.now().toString()}.pdf`,
            ContentType: "application/pdf",
        };


        const res = await s3.upload(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ url: res.Location }),
            isBase64Encoded: false,
            headers: {
                'Access-Control-Allow-Method': "POST",
                'Access-Control-Allow-Origin': "*"
            }
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Something went wrong!" }),
            isBase64Encoded: false,
            headers: {
                'Access-Control-Allow-Method': "POST",
                'Access-Control-Allow-Origin': "*"
            }
        };
    }
};