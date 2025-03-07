import { Given } from "cypress-cucumber-preprocessor/steps";
import { faker } from "@faker-js/faker";

const creators = {
  audience_beneficiaries: () => {
    cy.visit("/admin/structure/taxonomy/manage/audience_beneficiaries/add");
    cy.scrollTo("top");
    cy.findAllByLabelText("Name").type(
      `[Test Data] ${faker.lorem.sentence()}`,
      { force: true }
    );
    return cy.wait(1000);
  },
  products: () => {
    cy.visit("/admin/structure/taxonomy/manage/products/add");
    cy.scrollTo("top");
    cy.findAllByLabelText("Name").type(
      `[Test Data] ${faker.lorem.sentence()}`,
      { force: true }
    );
    cy.findAllByLabelText("Description").type(faker.lorem.sentence(), {
      force: true,
    });
    return cy.wait(1000);
  },
  health_care_service_taxonomy: () => {
    cy.visit(
      "/admin/structure/taxonomy/manage/health_care_service_taxonomy/add"
    );
    cy.scrollTo("top");
    cy.findAllByLabelText("Name").type(
      `[Test Data] ${faker.lorem.sentence()}`,
      { force: true }
    );
    cy.findAllByLabelText("Description").type(faker.lorem.sentence(), {
      force: true,
    });
    cy.findAllByLabelText("Health Service API ID").type(
      faker.datatype.number(),
      { force: true }
    );

    cy.get("#edit-moderation-state-0-state").select("published", {
      force: true,
    });

    return cy.wait(1000);
  },
  va_benefits_taxonomy: () => {
    cy.visit("admin/structure/taxonomy/manage/va_benefits_taxonomy/add");
    cy.scrollTo("top");
    cy.findAllByLabelText("Official Benefit name").type(
      `[Test Data] ${faker.lorem.sentence()}`,
      { force: true }
    );
    cy.get("#edit-field-va-benefit-api-id-0-value").type(
      faker.datatype.number(),
      { force: true }
    );

    cy.get("#edit-moderation-state-0-state").select("published", {
      force: true,
    });

    return cy.wait(1000);
  },
};

Given("I create a {string} taxonomy term", (vocabulary) => {
  const creator = creators[vocabulary];
  assert.isNotNull(
    creator,
    `I do not know how to create ${vocabulary} taxonomy terms yet.  Please add a definition in ${__filename}.`
  );
  creator().then(() => {
    cy.get("#edit-revision-log-message-0-value").type(
      `[Test revision log 1]${faker.lorem.sentence()}`,
      { force: true }
    );
    cy.get("form.taxonomy-term-form").find("input#edit-submit").click();
    cy.getLastCreatedTaxonomyTerm().then((tidCommand) => {
      cy.log(tidCommand);
      cy.wrap(tidCommand.stdout).as("termId");
    });
    cy.window().then((window) => {
      const pagePath = window.location.pathname;
      cy.wrap(pagePath).as("pagePath");
    });
  });
});
