export interface Breadcrumb {
  title: string;
  path?: string;
}

export interface RouteHandle {
  breadcrumb?:
    | Breadcrumb
    | Breadcrumb[]
    | ((data: any) => Breadcrumb | Breadcrumb[]);
}
