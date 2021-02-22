<?php

namespace Drupal\va_gov_content_export\ImportCommand;

use Drupal\tome_sync\Event\TomeSyncEvents;
use Drupal\tome_sync\ImporterInterface;
use Drupal\va_gov_content_export\ExportCommand\CommandRunner;
use Drupal\va_gov_content_export\ExportCommand\ExecutableFinder;
use Symfony\Component\EventDispatcher\Event;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Build a list of commands to run for the export.
 */
class ImportCommand {
  use CommandRunner;

  /**
   * Tome Exporter.
   *
   * @var \Drupal\tome_sync\ExporterInterface
   */
  protected $importer;

  /**
   * Event dispatcher.
   *
   * @var \Symfony\Component\EventDispatcher\EventDispatcher
   */
  private $eventDispatcher;

  /**
   * Execuitable Finder.
   *
   * @var \Drupal\va_gov_content_export\ExportCommand\ExecutableFinder
   */
  protected $executableFinder;

  public function __construct(ImporterInterface $importer, EventDispatcherInterface $eventDispatcher, ExecutableFinder $executableFinder) {
    $this->importer = $importer;
    $this->eventDispatcher = $eventDispatcher;
    $this->executableFinder = $executableFinder;
  }

  /**
   * Build a list of commands to run.
   *
   * @param int $entity_count
   *   The number of entities to split commands by.
   *
   * @return array
   *   Array of commands.
   */
  public function importContent(int $entity_count, int $process_count, int $retry_count) {
    $chunked_names = $this->importer->getChunkedNames();
    $executable = $this->executableFinder->findExecutable('va-gov-cms-import-all-content');
    foreach ($chunked_names as $chunk) {
      if (empty($chunk)) {
        continue;
      }

      $commands = [];
      foreach (array_chunk($chunk, $entity_count) as $names) {
        $commands[] = $executable . ' va-gov-cms-import-content ' . escapeshellarg(implode(',', $names));
      }
      $collected_errors = $this->runCommands($commands, $process_count, $retry_count);
      if ($collected_errors) {
        return $collected_errors;
      }
    }

    return [];
  }

  public function run(int $entity_count, int $concurrency = 1, int $retry_count = 0) : array {
    $errors = $this->importContent($entity_count, $concurrency, $retry_count);
    $this->eventDispatcher->dispatch(TomeSyncEvents::IMPORT_ALL, new Event());
    return $errors;
  }

}
