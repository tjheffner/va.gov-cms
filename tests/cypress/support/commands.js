/* eslint-disable max-nested-callbacks */
/* eslint-disable no-console */
import "@testing-library/cypress/add-commands";
import "cypress-axe";
import "cypress-file-upload";
import "cypress-real-events/support";
import "cypress-xpath";
import "./main_content_blocks";

const compareSnapshotCommand = require("cypress-visual-regression/dist/command");

Cypress.Commands.add("drupalLogin", (username, password) => {
  cy.visit("/user/login");

  cy.get("#user-login-form").then(($form) => {
    // PIV login by default in claro theme, so cypress checks for the toggle to click it.
    if ($form.hasClass("piv-login")) {
      cy.get(".js-va-login-toggle").click();
    }
  });

  cy.get("#edit-name").type(username);
  cy.get("#edit-pass").type(password);
  cy.get("#edit-submit").click();
  cy.window().then((window) => {
    cy.wrap(window.drupalSettings.user.uid).as("uid");
  });
  cy.injectAxe();
  cy.checkAccessibility();
});

Cypress.Commands.add("drupalLogout", () => {
  cy.visit("/user/logout");
});

Cypress.Commands.add("drupalDrushCommand", (command) => {
  let cmd = "drush %command";
  if (Cypress.env("VAGOV_INTERACTIVE")) {
    cmd = "ddev drush %command";
  }
  if (typeof command === "string") {
    command = [command];
  }
  return cy.exec(cmd.replace("%command", command.join(" ")));
});

Cypress.Commands.add("drupalDrushEval", (php) => {
  return cy.drupalDrushCommand(["php:eval", `'${php.replace(/'/g, `'\\''`)}'`]);
});

Cypress.Commands.add("drupalDrushUserCreate", (username, password) => {
  return cy.drupalDrushCommand([
    "user:create",
    username,
    `--password=${password}`,
    `--mail=${username}@example.org`,
  ]);
});

Cypress.Commands.add("drupalDrushUserRoleAdd", (username, role) => {
  return cy.drupalDrushCommand(["user:role:add", role, username]);
});

Cypress.Commands.add("drupalAddUserWithRole", (role, username, password) => {
  cy.drupalDrushUserCreate(username, password);
  return cy.drupalDrushUserRoleAdd(username, role);
});

Cypress.Commands.add("drupalAddUserWithRoles", (roles, username, password) => {
  cy.drupalDrushUserCreate(username, password);
  roles.forEach((role) => cy.drupalDrushUserRoleAdd(username, role));

  return cy;
});

Cypress.Commands.add(
  "drupalGetWatchdogMessages",
  (username, severity = "Warning") => {
    const fields = ["wid", "date", "type", "severity", "message", "username"];
    const command = `watchdog:show --format=json --severity=${severity} --fields=${fields.join(
      ","
    )}`;
    return cy.drupalDrushCommand(command).then((output) => {
      return cy
        .log(output)
        .then(() => {
          return JSON.parse(output.stdout || "{}");
        })
        .then((json) => {
          return cy.log(json).then(() => {
            return Object.values(json).filter(
              (entry) => entry.username === username
            );
          });
        })
        .then((entries) => {
          return cy.log(entries).then(() => {
            return entries;
          });
        });
    });
  }
);

Cypress.Commands.add("drupalWatchdogHasNoNewMessages", (username, severity) => {
  cy.drupalGetWatchdogMessages(username, severity).then((messages) => {
    cy.log(messages);
    expect(messages.length).to.equal(0);
  });
});

Cypress.Commands.add("drupalWatchdogHasNoNewErrors", (username) => {
  cy.drupalGetWatchdogMessages(username, "Error").then((messages) => {
    cy.log(messages);
    expect(messages.length).to.equal(0);
  });
});

Cypress.Commands.add(
  "drupalWatchdogHasNewMessages",
  (username, severity, count) => {
    cy.drupalGetWatchdogMessages(username, severity).then((messages) => {
      cy.log(messages);
      expect(messages.length).to.equal(count);
    });
  }
);

Cypress.Commands.add("drupalWatchdogHasNewErrors", (username, count) => {
  cy.drupalGetWatchdogMessages(username, "Error").then((messages) => {
    cy.log(messages);
    expect(messages.length).to.equal(count);
  });
});

Cypress.Commands.add("iframe", { prevSubject: "element" }, ($iframe) => {
  return cy
    .wrap($iframe)
    .should((iframe) => expect(iframe.contents().find("body")).to.exist)
    .then((iframe) => cy.wrap(iframe.contents().find("body")));
});

Cypress.Commands.add("get_ckeditor", (element) => {
  cy.wait(5000);
  return cy.window().then((win) => {
    const elements = Object.keys(win.CKEDITOR.instances);
    const index = elements.indexOf(element);
    if (index === -1) {
      const matches = elements.filter((el) => el.includes(element));
      if (matches.length) {
        // eslint-disable-next-line prefer-destructuring
        element = matches[0];
      } else {
        throw new Error(`CKEditor instance not found: ${element}`);
      }
    }
    return cy.wrap(win.CKEDITOR.instances[element]);
  });
});

Cypress.Commands.add("type_ckeditor", (element, content) => {
  return cy.get_ckeditor(element).then((editor) => {
    return cy.wrap(editor.setData(content));
  });
});

Cypress.Commands.add("read_ckeditor", (element) => {
  return cy.get_ckeditor(element).then((editor) => {
    return cy.wrap(editor.getData());
  });
});

Cypress.Commands.add("scrollToSelector", (selector) => {
  return cy.document().then((document) => {
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.style.scrollBehavior = "inherit";
    }
    cy.get(selector).scrollIntoView({ offset: { top: 0 } });
    return cy.get(selector);
  });
});

Cypress.Commands.add("scrollToXpath", (xpath) => {
  return cy.document().then((document) => {
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.style.scrollBehavior = "inherit";
    }
    cy.xpath(xpath).scrollIntoView({ offset: { top: 0 } });
    return cy.xpath(xpath);
  });
});

Cypress.Commands.add("getDataLayer", () => {
  return cy
    .window()
    .then((window) =>
      window.dataLayer.filter((object) => object.event === "pageLoad").pop()
    );
});

Cypress.Commands.add("getDrupalSettings", () => {
  return cy.window().then((window) => window.drupalSettings);
});

Cypress.Commands.add("getLastCreatedTaxonomyTerm", () => {
  return cy.get("@uid").then((uid) => {
    const command = `
        $query = \\Drupal::entityQuery('taxonomy_term');
        $result = $query
          ->condition('revision_user', ${uid})
          ->sort('revision_created' , 'DESC')
          ->execute();
        echo reset($result);
      `;
    return cy.drupalDrushEval(command);
  });
});

Cypress.Commands.add("unsetWorkbenchAccessSections", () => {
  return cy.get("@uid").then((uid) => {
    const command = `
        $user = \\Drupal\\user\\Entity\\User::load(${uid});
        $section_scheme = \\Drupal::entityTypeManager()->getStorage('access_scheme')->load('section');
        $section_storage = \\Drupal::service('workbench_access.user_section_storage');
        $current_sections = $section_storage->getUserSections($section_scheme, $user);
        if (!empty($current_sections)) {
          $section_storage->removeUser($section_scheme, $user, $current_sections);
        }
      `;
    return cy.drupalDrushEval(command);
  });
});

Cypress.Commands.add("setWorkbenchAccessSections", (value) => {
  return cy
    .unsetWorkbenchAccessSections()
    .then(() => cy.get("@uid"))
    .then((uid) => {
      const command = `
        $user = \\Drupal\\user\\Entity\\User::load(${uid});
        $section_scheme = \\Drupal::entityTypeManager()->getStorage('access_scheme')->load('section');
        $section_storage = \\Drupal::service('workbench_access.user_section_storage');
        $section_storage->addUser($section_scheme, $user, explode(',', '${value}'));
      `;
      return cy.drupalDrushEval(command);
    });
});

compareSnapshotCommand();

Cypress.on("uncaught:exception", () => {
  // Prevent Cypress from automatically failing tests in response to uncaught
  // application exceptions.
  return false;
});

beforeEach(() => {
  // Requests to Google Tag Manager can cause spurious test failures.
  cy.intercept("https://www.googletagmanager.com/gtm.js**", {
    statusCode: 200,
    body: "",
    headers: {
      "x-response-header": "ha ha ha disregard this",
    },
  });
});
