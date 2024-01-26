import Layout from "@/layout";
import Article from "@/pages/Article/Index.tsx";
import InterfaceSys from "@/pages/Favorite/Index.tsx";
import Editor from '@/pages/Article/Editor/Index.tsx';
import Upload from '@/pages/Upload/Index.tsx';
import {lazy, ReactNode} from "react";


interface Router {
    name?: string;
    path: string;
    children?: Array<Router>;
    meta?: {
        title?: string,
        icon?: ReactNode
    },
    element: ReactNode;
}

const router: Array<Router> = [
    {
        path: 'editor',
        element: <Editor/>
    },
    {
        path: '/backstage',
        element: <Layout />,
        children: [
            {
                path: 'article',
                element: <Article />,
            },
            {
                path: 'interface',
                element: <InterfaceSys />,
            },
            {
                path: 'upload',
                element: <Upload/>
            }
        ]
    }
]

export default router;
