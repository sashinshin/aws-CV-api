import * as cdk from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Stack, Duration } from 'aws-cdk-lib';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { Construct } from 'constructs';


export class AwsCvApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'CVPipeline', {
      pipelineName: 'CVPipeline',
      dockerEnabledForSynth: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('sashinshin/aws-CV-api', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      }),
    });

    const cvBucket = new Bucket(this, 'CVBucket', {
      bucketName: "salt-temp-cv-bucket",
      publicReadAccess: true,
    });

    const uploadCvLambda = new NodejsFunction(this, "uploadCvLambda", {
      description: "Lambda that uploads cv to s3 bucket",
      handler: "handler",
      entry: join(__dirname, "../lambda/uploadCv/index.ts"),
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      environment: {
        BUCKET_NAME: cvBucket.bucketName,
      },
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["s3:*"],
          resources: [`${cvBucket.bucketArn}/*`]
        }),
      ]
    });

    const api = new RestApi(this, "saltAPI");
    api.root
      .resourceForPath("cv")
      .addMethod("POST", new LambdaIntegration(uploadCvLambda));


  };
};
