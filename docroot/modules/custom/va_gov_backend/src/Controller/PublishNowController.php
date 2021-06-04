<?php

namespace Drupal\va_gov_backend\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Processes Publish Now! requests.
 */
class PublishNowController extends ControllerBase {

  /**
   * AWS SQS Client.
   *
   * @var \Aws\Sqs\SqsClient
   */
  protected $sqsClient;

  /**
   * Settings.
   *
   * @var \Drupal\Core\Site\Settings
   */
  protected $settings;

  /**
   * Publish Now service.
   *
   * @var \Drupal\va_gov_backend\Service\PublishNow
   */
  protected $publishNow;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $instance = parent::create($container);
    $instance->sqsClient = $container->get('va_gov_backend.aws_sqs_client');
    $instance->settings = $container->get('settings');
    $instance->publishNow = $container->get('va_gov_backend.publish_now');
    return $instance;
  }

  /**
   * Publish the node now!
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   * @param \Drupal\node\NodeInterface|null $node
   *   The node to publish.
   */
  public function publishNow(Request $request, NodeInterface $node = NULL) {
    if (!$this->publishNow->canPublishNode($node)) {
      throw new \Exception('This node cannot be published in its present form.');
    }
    $queueUrl = $this->settings->get('va_gov_publish_now_queue_url');
    $attributes = [];
    $nid = $node->id();
    $path = $node->toUrl()->toString();
    $body = [
      'nid' => $nid,
      'path' => $path,
    ];
    $response = $this->sqsClient->sendMessage([
      'MessageBody' => json_encode($body),
      'QueueUrl' => $queueUrl,
      'MessageAttributes' => $attributes,
    ]);
    $responseArray = print_r($response->toArray(), TRUE);
    $jsonResponse = json_encode($response->toArray(), NULL, 2);
    $pagePath = "https://dev.va.gov$path";
    $trimPath = trim($path, '/');
    $s3Path = "https://console.amazonaws-us-gov.com/s3/buckets/content.dev.va.gov?region=us-gov-west-1&prefix=$trimPath/&showversions=false";
    $message = <<<EOF
<p>Node $nid ($path) was submitted to the SQS queue.</p>

<p>The S3 bucket objects should be viewable at <a href="$s3Path">$s3Path</a> shortly.</p>

<p>The page should be available at <a href="$pagePath">$pagePath</a> shortly.</p>

The raw data returned from AWS is as follows:

<pre>
$responseArray

$jsonResponse
</pre>
EOF;
    return [
      '#type' => 'markup',
      '#markup' => $message,
    ];
  }

}
