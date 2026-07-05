import React, { useEffect, useState } from 'react';
import DataTable from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { columns } from './columns';
import { DataTableToolbar } from './DataTableToolbar';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api_axios';

// 🔒 Normal role user (uiux / seo / developer) ke liye READ-ONLY credentials page.
// - Sirf usi role ke credentials dikhte hai (backend `/credentials` route khud filter karta hai)
// - Koi "Add New" button nahi hai
// - Koi row select / bulk delete / revoke nahi hai
// - Sirf "Details" (view + copy) allowed hai
const UserCredentials = () => {
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const navigate = useNavigate();

    const fetchCredentials = async () => {
        try {
            const res = await api.get("/credentials", {
                params: {
                    search: search || undefined,
                    page: pagination.page,
                    limit: pagination.limit,
                },
            });
            setRows(res.data.data || []);
            setPagination((p) => ({ ...p, ...res.data.pagination }));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit]);

    return (
        <>
            <div className="flex items-start mb-4 justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Credentials</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Read-only — showing credentials assigned to your role.
                    </p>
                </div>
            </div>

            <Separator />

            <DataTable
                searchKey="projectName"
                columns={columns()}
                data={rows}
                pagination={pagination}
                setPagination={setPagination}
                toolbar={(table) => <DataTableToolbar table={table} />}
            />
        </>
    );
};

export default UserCredentials;
