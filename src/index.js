// import PhoneHeader from './components/PhoneHeader';
// import CatchPhrase from './components/CatchPhrase';
const helpers = require('./helpers');

const columns = [
    { key: 'id' },
    { key: 'name', title: 'ФИО' },
    { key: 'username', title: 'Логин' },
    {
        key: 'email',
        options: {
            sortable: true,
        },
    },
    {
        key: 'address',
        title: 'Адрес',
        sortable: true,
        children: [
            {
                key: 'street',
                title: 'Улица',
            },
            {
                key: 'suite',
                title: 'Корпус',
            },
            {
                key: 'city',
                title: 'Город',
            },
            {
                key: 'zipcode',
                title: 'Индекс',
            },
            {
                key: 'geo',
                title: 'Геолокация',
                children: [
                    {
                        key: 'lat',
                        title: 'Широта',
                        sortable: true,
                    },
                    {
                        key: 'lng',
                        title: 'Долгота',
                    },
                ],
            },
        ],
    },
    {
        key: 'phone',
        title: 'Phone',
    },
    {
        key: 'website',
        title: 'Сайт',
    },
    {
        key: 'company',
        title: 'Компания',
        children: [
            {
                key: 'name',
                title: 'Наименование',
            },
            {
                key: 'catchPhrase',
                title: 'Ключевые слова',
                props: {
                    foo: 'bar',
                },
                sortable: true,
            },
        ],
    },
];

console.log(helpers.decompose(columns));

