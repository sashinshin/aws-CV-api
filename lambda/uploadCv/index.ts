import { S3 } from "aws-sdk";

const s3 = new S3();

export const getEnvVar = (input: string) => {
    const value = process.env[input];
    if (typeof value === "string") {
        return value;
    }
    throw new Error(`process.env.${input} was not set`)
}


export const handler = async (event: any) => {
    console.log("Data:");
    console.log(event);
    const data = { body: event.body, key: "key.pdf" };
    


    const s3Upload = s3.upload({
        Body: data.body,
        Bucket: getEnvVar("BUCKET_NAME"),
        Key: data.key,
    });

    const res = s3Upload.promise();

    console.log("res:");
    console.log(res)
    return {
        statusCode: 200,
        body: JSON.stringify(res),
        isBase64Encoded: false,
        headers: {
            'Access-Control-Allow-Method': "POST",
            'Access-Control-Allow-Origin': "*"
        }
    };
};