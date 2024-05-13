import React, { useEffect, useState } from 'react'
import Tracker from './pages/tracker'
import Login from './pages/login';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient("https://ckrlcmjptudsfwcezkpv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrcmxjbWpwdHVkc2Z3Y2V6a3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUzMzUxMTgsImV4cCI6MjAzMDkxMTExOH0.I7I-eSiYm2e9KgU9a1a0wMToZYpd_M6NW9_h6l2lqrk");


const App = () => {
  const [UserData, setUserData] = useState([]);
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const userDataString = localStorage.getItem('userData');
      if (userDataString !== null) {
        setUserData(JSON.parse(userDataString))
      }
    }
  }, [])

  return (
    <>
      {UserData?.length ?
        <Tracker userData={UserData} />
        :
        <Login callBack={(user: any) => setUserData(user)} />
      }
    </>
  )
}

export default App