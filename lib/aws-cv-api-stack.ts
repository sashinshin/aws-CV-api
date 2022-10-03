import * as cdk from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

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
          'npx cdk synth',
        ],
      }),
    });

  }
}
