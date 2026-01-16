'use client';
import Table, { DetailTable, TableImage } from '@/app/components/common/table/table';
import { paymentList } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { getStatusClass } from '@/app/helpers/utils';
import { Modal } from 'antd';
import React, { useState } from 'react';

const Page = () => {
    const [data, getData] = useFetch(paymentList);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleView = (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRow(null);
        setIsModalOpen(false);
    };

    const columns = [
        {
            text: 'image',
            dataField: 'user',
            formatter: (_, d) => (
                <TableImage url={d?.user?.image} />
            ),
        },
        {
            text: 'Name',
            dataField: 'user',
            formatter: (_, d) => (
                <span className='line-clamp-2 w-[150px] text-wrap sm:w-[250px]'>{d?.user?.name}</span>
            ),
        },
        {
            text: 'Attorney',
            dataField: 'attorney',
            formatter: (_, d) => (
                <span className='line-clamp-2 w-[150px] text-wrap sm:w-[250px]'>{d?.attorney?.name}</span>
            ),
        },
        {
            text: 'Amount',
            dataField: 'payment',
            formatter: (_, d) => (
                <span className='line-clamp-2 w-[150px] text-wrap sm:w-[250px]'>{d?.payment?.amount || 0}$</span>
            ),
        },
        {
            text: 'payment method',
            dataField: 'payment',
            formatter: (_, d) => (
                <span className='line-clamp-2 w-[150px] text-wrap sm:w-[250px]'>{d?.payment?.method}</span>
            ),
        },
        {
            text: 'payment status',
            dataField: 'payment',
            formatter: (_, d) => (
                <span className={`${getStatusClass(d?.payment?.status)}`}>
                    {d?.payment?.status}
                </span>
            ),
        },
    ];

    return (
        <div>
            <Table
                data={data}
                pagination
                indexed
                onView={handleView}
                columns={columns}
                onReload={getData}
            />
            {isModalOpen && (
                <Modal open={isModalOpen} onCancel={closeModal} width={800} footer={null} onClose={closeModal}>
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                        <DetailTable data={selectedRow} title={'User Details'} columns={[
                            { text: 'Image', dataField: 'user ', formatter: (_, d) => <TableImage url={d?.user?.image} /> },
                            { text: 'Name', dataField: 'user', formatter: (_, d) => <span className='capitalize'>{d?.user?.name}</span> },
                            { text: 'Email', dataField: 'user', formatter: (_, d) => <span className='capitalize'>{d?.user?.email}</span> },
                            { text: 'Phone', dataField: 'user', formatter: (_, d) => <span className='capitalize'>{d?.user?.phone_no}</span> },
                            { text: 'Address', dataField: 'user', formatter: (_, d) => <span className='capitalize'>{d?.user?.per_address}</span> },
                        ]} />
                        <DetailTable data={selectedRow} title={'Attorney Details'} columns={[
                            { text: 'Image', dataField: 'attorney ', formatter: (_, d) => <TableImage url={d?.attorney?.image} /> },
                            { text: 'Name', dataField: 'attorney', formatter: (_, d) => <span className='capitalize'>{d?.attorney?.name}</span> },
                            { text: 'Email', dataField: 'attorney', formatter: (_, d) => <span className='capitalize'>{d?.attorney?.email}</span> },
                            { text: 'Phone', dataField: 'attorney', formatter: (_, d) => <span className='capitalize'>{d?.attorney?.phone_no}</span> },
                            { text: 'Designation', dataField: 'attorney', formatter: (_, d) => <span className='capitalize'>{d?.attorney?.designation}</span> },
                        ]} />
                    </div>
                    <DetailTable data={selectedRow} title={'payment Details'} columns={[
                        { text: 'payment method', dataField: 'payment ', formatter: (_, d) => <span className='capitalize'>{d?.payment?.method} </span> },
                        {
                            text: 'payment status', dataField: 'payment', formatter: (_, d) => (
                                <span className={`${getStatusClass(d?.payment?.status)}`}>
                                    {d?.payment?.status}
                                </span>
                            )
                        },
                        { text: 'amount', dataField: 'payment', formatter: (_, d) => <span className='capitalize'>{d?.payment?.amount}</span> },
                        { text: 'Transaction Id', dataField: 'payment', formatter: (_, d) => <span className='capitalize'>{d?.payment?.transaction_id}</span> },

                    ]} />
                </Modal>
            )}
        </div>
    );
};

export default Page;