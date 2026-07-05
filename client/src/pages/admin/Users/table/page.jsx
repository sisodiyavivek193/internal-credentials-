import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import { DataTableToolbar } from './DataTableToolbar';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api_axios';

const UserClient = () => {
    const [credentials, setCredentials] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);


    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    const navigate = useNavigate();

    const fetchCredentials = async () => {
        try {
            // const res = await api.get("/admin/users");
            const res = await api.get("/admin/users", {
                params: {
                    search: search || undefined,
                    page: pagination.page,
                    limit: pagination.limit,
                },
            });

            setRows(res.data.data);
            setPagination(res.data.pagination);
            console.log("🚀 ~ fetchCredentials ~ res.data.pagination:", res.data.pagination)
        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/login", { replace: true });
            } else {
                console.error("Fetch Error:", error);
            }
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, [pagination.page, pagination.limit]);

    const onRefresh = () => fetchCredentials();

    const navigateToNewUser = () => {
        navigate("/admin/user");
    };

    return (
        <>
            <div className="flex items-start mb-4 justify-between">
                <h1 className="text-3xl font-bold">Users</h1>
                <Button onClick={navigateToNewUser}>
                    <Plus />
                    <span className='pl-2'>Add New</span>
                </Button>
            </div>

            <Separator />

            <DataTable
                searchKey="projectName"
                columns={columns({ onRefresh })}
                data={rows}
                pagination={pagination}
                setPagination={setPagination}
                toolbar={(table) => <DataTableToolbar table={table} onRefresh={onRefresh} setSearch={setSearch} />}
            />

        </>
    );
};

export default UserClient;
