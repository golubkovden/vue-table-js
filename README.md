# Installation

``` bash
npm install vue-table-js --save
```

# Hello world

``` html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body>
<div id="app">
    <vue-elastic-table :columns="columns" :data="data"></vue-elastic-table>
</div>
</body>
<!-- import Vue before Element -->
<script src="https://unpkg.com/vue/dist/vue.js"></script>
<!-- import JavaScript -->
<script src="https://unpkg.com/vue-table-js/dist/vue-table-js.iife.js"></script>
<!-- Boot Vue instance -->
<script>
    new Vue({
        el: '#app',
        components: { VueTableJs },
        data: {
            columns: ['id', 'name'],
            data: [
                {id: 1, name: 'John'},
                {id: 2, name: 'Mike'},
            ],
        },
    });
</script>
</html>
```

# Component props

## Columns 
* type: `String|Object` (see [Columns definition](#columns-definition))
* required

## Data 
* type: `Array<Object>`
* default: `[]`

## RowClass
* type: `String|Function`
* default: `undefined`

We can pass a string to `v-bind:row-class` to dynamically apply table row with specified class.
If you would like to add custom logic, you can do it with function, which return value compatible with 
[vue class bindings] types.

```javascript
function fn(item, index) {
  // item - current element in an array of data props
  // index  - index of element
  return ['foo', 'bar'];
}
```

## MultipleSorting
* type: `Boolean`
* default: `false`

# #Columns definition

## key
* type: `String`
* default: `undefined`

Key of the data to be display. In multilevel headers you can leave the field `undefined` to combine different keys 
in one table column.  
```javascript
const column = {
    title: 'Foo',
    children: [
        'id', 
        'name'
    ]
}
```

## title 
* type: `String|Function|Object`
* default: `undefined`

Here you can define what will be rendered inside table header cell. Otherwise `key` option will be used. Using this 
option as `function` is useful with i18n. Also you can use [vue components].

> If you are using [functional component] you **must** provide v-bind and v-on by yourself

``` html 
<template functional>
    <th v-bind="data.attrs" v-on="listeners">Custom table header</th>
</template>
```

## #component
* type: `String|Object`
* default: `undefined`

The vue component that will be used for display data in table data cell.

```vue
<template>
    <td>
      <span class="foo bar">{{ data }}</span>
    </td>
</template>

<script>
    export default {
        props: {
            // The data of the selected by key path in current row
            data: {
                required: true,
            },
            // Other props available to be passed see in props below
        }
    }
</script>
```

## #sortable
* type: `boolean|string`
* default: `false`

Define is a column are sortable. 
Using as `string` allows you override default behavior (full path of keys), see [events](#events)

Appends to table header cell classes `sortable`, `desc` or `asc` 

## props
* type: `Object|Function`
* default: `undefined`

Additional props passed into [component](#component)

## transform
* type `Function|Array<Function>`,
* default: `undefined`

## children
* type: `Array<Column>`
* default: `undefined`

Sub columns

``` js
{
    key: 'geo',
    title: 'Geolocation',
    children: [
        {key: 'lat', title: 'Latitude'},
        {key: 'lng', title: 'Longitude'},
    ],
},
```

# #Events

## sorted
Event fired when user clicked on [`sorted` column](#sortable). Example of incoming payload of event

```
[
    {column: 'id', direction: 'asc'},
    // if using multiple-sorting option 
    {column: 'name', direction: 'desc'},
    // if sortable option in column definition equals {..., sortable: 'my-custom-field', ...}
    {column: 'my-custom-field', direction: 'asc'},
]
```


[vue class bindings]: https://vuejs.org/v2/guide/class-and-style.html#Binding-HTML-Classes
[vue components]: https://vuejs.org/v2/guide/components.html
[functional component]: https://vuejs.org/v2/guide/render-function.html#Functional-Components
