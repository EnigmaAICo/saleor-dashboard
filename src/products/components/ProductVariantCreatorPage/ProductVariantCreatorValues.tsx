import { Card, CardContent } from "@material-ui/core";
import Alert from "@saleor/components/Alert/Alert";
import { getMultiChoices } from "@saleor/components/Attributes/utils";
import CardSpacer from "@saleor/components/CardSpacer";
import CardTitle from "@saleor/components/CardTitle";
import MultiAutocompleteSelectField from "@saleor/components/MultiAutocompleteSelectField";
import Skeleton from "@saleor/components/Skeleton";
import { getById } from "@saleor/orders/components/OrderReturnPage/utils";
import { ProductDetails_product_productType_variantAttributes } from "@saleor/products/types/ProductDetails";
import { SearchAttributeValues_attribute_choices_edges_node } from "@saleor/searches/types/SearchAttributeValues";
import { makeStyles } from "@saleor/theme";
import { FetchMoreProps } from "@saleor/types";
import { mapSlugNodeToChoice } from "@saleor/utils/maps";
import React from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

import { Attribute, ProductVariantCreateFormData } from "./form";

const messages = defineMessages({
  multipleValueLabel: {
    defaultMessage: "Values",
    description: "attribute values"
  }
});

export function getVariantsNumber(data: ProductVariantCreateFormData): number {
  return data.attributes.reduce(
    (variants, attribute) => variants * attribute.values.length,
    1
  );
}

export function getMultiValues(
  attributes: Attribute[],
  attribute: ProductDetails_product_productType_variantAttributes
) {
  return attributes
    .find(getById(attribute.id))
    ?.values?.map(value => value.slug);
}

export function getMultiDisplayValues(
  attributes: Attribute[],
  attribute: ProductDetails_product_productType_variantAttributes
) {
  return mapSlugNodeToChoice(attributes.find(getById(attribute.id))?.values);
}

export interface ProductVariantCreatorValuesProps {
  attributes: ProductDetails_product_productType_variantAttributes[];
  attributeValues: SearchAttributeValues_attribute_choices_edges_node[];
  fetchAttributeValues: (query: string) => void;
  fetchMoreAttributeValues?: FetchMoreProps;
  data: ProductVariantCreateFormData;
  variantsLeft: number | null;
  onValueClick: (
    attributeId: string,
    value: SearchAttributeValues_attribute_choices_edges_node
  ) => void;
  onAttributeSelect: (id: string) => void;
}

const useStyles = makeStyles(
  theme => ({
    valueContainer: {
      display: "grid",
      gridColumnGap: theme.spacing(3),
      gridTemplateColumns: "repeat(5, 1fr)"
    }
  }),
  { name: "ProductVariantCreatorValues" }
);

const ProductVariantCreatorValues: React.FC<ProductVariantCreatorValuesProps> = props => {
  const {
    attributes,
    attributeValues,
    fetchAttributeValues,
    fetchMoreAttributeValues,
    data,
    variantsLeft,
    onValueClick,
    onAttributeSelect
  } = props;
  const classes = useStyles(props);
  const intl = useIntl();
  const variantsNumber = getVariantsNumber(data);

  const handleValueClick = (attributeId: string, valueSlug: string) => {
    onValueClick(
      attributeId,
      attributeValues.find(value => value.slug === valueSlug)
    );
  };

  return (
    <>
      {variantsLeft !== null && (
        <Alert
          show={variantsNumber > variantsLeft}
          title={intl.formatMessage({
            defaultMessage: "SKU limit reached",
            description: "alert"
          })}
        >
          <FormattedMessage
            defaultMessage="You choices will add {variantsNumber} SKUs to your catalog which will exceed your limit by {aboveLimitVariantsNumber}. If you would like to up your limit, contact your administration staff about raising your limits."
            values={{
              variantsNumber,
              aboveLimitVariantsNumber: variantsNumber - variantsLeft
            }}
          />
        </Alert>
      )}
      {attributes.map(attribute => (
        <React.Fragment key={attribute.id}>
          <Card>
            <CardTitle title={attribute?.name || <Skeleton />} />
            <CardContent
              className={classes.valueContainer}
              data-test-id="value-container"
            >
              <MultiAutocompleteSelectField
                choices={getMultiChoices(attributeValues)}
                displayValues={getMultiDisplayValues(
                  data.attributes,
                  attribute
                )}
                name={`attribute:${attribute.name}`}
                label={intl.formatMessage(messages.multipleValueLabel)}
                value={getMultiValues(data.attributes, attribute)}
                onChange={event =>
                  handleValueClick(attribute.id, event.target.value)
                }
                allowCustomValues={true}
                fetchChoices={fetchAttributeValues}
                {...fetchMoreAttributeValues}
                onClick={() => onAttributeSelect(attribute.id)}
              />
            </CardContent>
          </Card>
          <CardSpacer />
        </React.Fragment>
      ))}
    </>
  );
};

ProductVariantCreatorValues.displayName = "ProductVariantCreatorValues";
export default ProductVariantCreatorValues;
