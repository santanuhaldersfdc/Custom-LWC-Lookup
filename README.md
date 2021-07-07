## Custom Lightning Web Component lookup.

This is a generic custom lookup component which can be used in any parent LWC component or Aura component

## Input parameters

- **objectName** : This parameter will take the object api name to search
- **whereClause** : This parameter will take any static where clause to add in your search
- **mainFieldToShow** : This is the API name of key field to show in search result
- **addnFieldToShow** : This is the API name of additional secondary field to identify your search result(optional)
- **numberOfResults** : This is the max results to show in one glace
- **iconName** : This takes a lightning icon name to show next to your search result

## Return paremeters

- **lookupvalueselected** : The child lookup component fires a CustomEvent called lookupvalueselected on selection of a search result by the user. Parent component should listen to this event.

- **event parameters**
when user selects a result
```
detail: {
    selectedId: 0010o00002u7pLZAAY
}
```
when user clears the selected value
```
detail: {
    selectedId: null
}
```