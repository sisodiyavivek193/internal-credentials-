// import React, { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import DataTable from '@/components/ui/data-table';
// import { Separator } from '@/components/ui/separator';
// import { Plus } from 'lucide-react';
// import { columns } from './columns';
// import { DataTableToolbar } from './DataTableToolbar';
// import { useNavigate } from 'react-router-dom';
// import api from '@/services/api_axios'; // make sure imported

// const UserClient = () => {

//     const [credentials, setCredentials] = useState([]);
//     const [search, setSearch] = useState("");
//     const [page, setPage] = useState(1);

//     const LIMIT = 20;
//     const navigate = useNavigate();

//     const fetchCredentials = async () => {
//         try {
//             const res = await api.get(
//                 `/admin/credentials`
//             );

//             console.log(res.data, 'res.data');


//             setCredentials(res.data || []);
//         } catch (error) {
//             if (error.response?.status === 401) {
//                 navigate("/login", { replace: true });
//             } else {
//                 console.error("Fetch Error:", error);
//             }
//         }
//     };

//     useEffect(() => {
//         fetchCredentials();
//     }, [search, page]);

//     // 🔥 Important callback to refresh data from CellAction
//     const onRefresh = () => {
//         fetchCredentials();
//     };

//     const navigateToNewUser = () => {
//         window.location.href = '/products/new';
//     };

//     return (
//         <>
//             <div className="flex items-start mb-4 justify-between">
//                 <Button onClick={navigateToNewUser}>
//                     <Plus />
//                     <span className='pl-2'>Add New</span>
//                 </Button>
//             </div>

//             <Separator />

//             <DataTable
//                 searchKey="projectName"
//                 columns={columns({ onRefresh })}
//                 data={credentials}
//                 toolbar={(table) => <DataTableToolbar table={table} setSearch={setSearch} />}
//             />




//         </>
//     );
// };

// export default UserClient;




import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import { DataTableToolbar } from './DataTableToolbar';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api_axios';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const Credentials = () => {
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
            const res = await api.get("/admin/credentials", {
                params: {
                    search: search || undefined,
                    page: pagination.page,
                    limit: pagination.limit,
                },
            });
            setRows(res.data.data);
            setPagination(res.data.pagination);
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
        navigate("/admin/credential");
    };



    return (
        <>
            <div className="flex items-start mb-4 justify-between">
                <h1 className="text-3xl font-bold">Wab Credentials</h1>
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

export default Credentials;
