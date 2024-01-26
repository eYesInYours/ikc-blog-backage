import {redirect, useLocation, useNavigate, useRoutes} from "react-router-dom";
import router from '@/router';
import './App.css'
import {Suspense, useEffect, useState} from "react";
import {message, Spin} from "antd";
import { throttle } from 'lodash';

function App() {
    const element = useRoutes(router);
    const navigate = useNavigate();
    const location = useLocation()

    const handleWheel = (e: any) => {
        if(e.ctrlKey){
            // e.preventDefault()
        }
    }

    const handleKeyDown = (e: any) => {
        if (e.ctrlKey && (e.key === '-' || e.key === '=')) {
            // e.preventDefault(); // 阻止默认的缩小快捷键行为
        }
    }

    useEffect(() => {
        if(location.pathname == '/')
            navigate('/backstage/article')

        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('wheel', handleWheel);
            document.removeEventListener('keydown', handleKeyDown);
        }

    }, [])

  return (
      <Suspense fallback={<Spin />} children={element} >
          {/*{element}*/}
      </Suspense>
  )
}

export default App