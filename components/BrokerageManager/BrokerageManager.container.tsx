import { createInjector, inject, mergeProps } from "unstateless";
import {BrokerageManagerComponent} from "./BrokerageManager.component";
import {IBrokerageManagerInputProps, BrokerageManagerProps, IBrokerageManagerProps} from "./BrokerageManager.d";
import { IBrokerage } from "@brokered-products-plugin-shared/brokerage/types";
import { useLoaderAsync } from "@core/lib/useLoader";
import { services } from "@core/lib/api";
import { useEffect, useState } from "react";
import { Editable } from "@core/components/Editable";
import { Button } from "antd";
import { DeleteBtn } from "@core/components/DeleteBtn";

const injectBrokerageManagerProps = createInjector(({}:IBrokerageManagerInputProps):IBrokerageManagerProps => {
    const [brokerages, setBrokerages] = useState<IBrokerage[]>([]);
    const loader = useLoaderAsync();

    const refresh = () => {
        loader(() => services().brokerage.search().then(setBrokerages));
    }

    const create = () => {
        loader(() => services().brokerage.create({
            name: "New Brokerage",
            urlTemplate: "http://example.com/{ID}",
        }).then(refresh));
    }

    const columns = [{
        title: "Name",
        key: "name",
        render: (_:any, brokerage:IBrokerage) => <Editable
            value={brokerage.name}
            onChange={(value) => {
                services().brokerage.update(brokerage.id, {name: value}).then(refresh);
            }}
            placeholder="Brokerage Name"
        />,
    }, {
        title: "URL",
        key: "urlTemplate",
        render: (_:any, brokerage:IBrokerage) => <Editable
            value={brokerage.urlTemplate}
            onChange={(value) => {
                services().brokerage.update(brokerage.id, {urlTemplate: value}).then(refresh);
            }}
            placeholder="URL Template"
        />,
    },{
        title: "Actions",
        key: "actions",
        render: (_:any, brokerage:IBrokerage) => <DeleteBtn entityType="brokerage" onClick={() => {
            services().brokerage.remove(brokerage.id).then(refresh);
        }} />,
    }];

    useEffect(() => {
        refresh();
    }, []);

    return {brokerages, isLoading: loader.isLoading, columns, create};
});

const connect = inject<IBrokerageManagerInputProps, BrokerageManagerProps>(mergeProps(
    injectBrokerageManagerProps,
));

export const BrokerageManager = connect(BrokerageManagerComponent);
