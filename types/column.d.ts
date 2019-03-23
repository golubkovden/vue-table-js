import Vue, {AsyncComponent, ComponentOptions} from 'vue';

type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent;

export interface TableOptions {
    columns: Column[] | string[];
    data?: Object[];
}

export interface Column {
    key?: string;
    title?: string;
    component?: Component;
    props?: () => Object | Object;
    sortable?: boolean | string;
    children?: Column[];
}