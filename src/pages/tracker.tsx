import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'

import { supabase } from '../App'
import { useIdleTimer } from 'react-idle-timer'

interface props {
    userData: any[]
}
const Tracker = ({ userData }: props) => {
    const MINUTE_MS = 60000;

    //#region Internal Hook
    const [timerData, setTimerData] = useState<any>([]);
    const [startTime, setStartTime] = useState('00:00');
    const [idleTime, setIdleTime] = useState('00:00');


    useEffect(() => {
        getTimerData()
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getStartTime();

        }, MINUTE_MS);

        return () => clearInterval(interval);

    }, [timerData])

    //#endregion

    //#region API call

    const onIdle = () => {
        handleIdleTime()
        reset()
    }

    const { getRemainingTime, reset } = useIdleTimer({
        onIdle,
        timeout: 30000,

    });

    const getTimerData = async () => {

        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

        let { data, error } = await supabase
            .from('TimeLog')
            .select("*")
            .eq('user_id', 1)
            .eq('date', formattedDate)

        data?.length && setTimerData(data)
        data?.length && data[0]?.user_idle_time > 0 && setIdleTime(otherTypeOfFormattedTime(data[0]?.user_idle_time))
    }
    //#endregion

    //#region Internal Functions
    const otherTypeOfFormattedTime = (diffInMs: number) => {
        // Calculate difference in seconds, minutes, hours, and days
        const minutes = Math.floor(diffInMs / (1000 * 60)) % 60;
        const hours = Math.floor(diffInMs / (1000 * 60 * 60)) % 24;

        // Format the difference string according to your needs
        let differenceString: string = '';
        differenceString = `${hours || '00'}:` + `${minutes < 10 ? '0' + minutes : minutes || '00'}`;
        return differenceString
    }

    const getFormatedTime = (otherTime?: any) => {
        const today = otherTime || new Date();
        const hours = today.getHours().toString().padStart(2, '0');
        const minutes = today.getMinutes().toString().padStart(2, '0');
        const seconds = today.getSeconds().toString().padStart(2, '0');

        const formattedTime = `${hours}:${minutes}:${seconds}`;
        return formattedTime
    }
    const getFormattedDate = () => {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        return formattedDate
    }
    const returnTimeInMs = (key: string) => {
        let now = new Date();
        const [hours, minutes, seconds]: any = timerData[0]?.[key].split(':').map(Number);

        now.setHours(hours, minutes, seconds, 0); // Set time components, milliseconds to 0
        return now.getTime()

    }
    const getStartTime = () => {
        if (timerData.length) {
            // timers 
            let startsTime = 0;
            let endsTime = 0;
            let breakStartTime = 0;
            let breakEndTime = 0;
            let idleTime = 0;

            if (timerData[0]?.start) {
                startsTime = returnTimeInMs('start')
            }

            if (timerData[0]?.end) {
                endsTime = returnTimeInMs('end')
            }

            if (timerData[0]?.break_starts) {
                breakStartTime = returnTimeInMs('break_starts')
            }

            if (timerData[0]?.break_end) {
                breakEndTime = returnTimeInMs('break_end')
            }

            if (timerData[0]?.idle_time) {
                idleTime = timerData[0]?.idle_time
            }

            const now = new Date();
            let diffInMs = 0;
            if (timerData[0]?.end) {
                console.log('punch out')
                //we taken diff between start and end time
                diffInMs = endsTime - startsTime - (breakEndTime - breakStartTime) - idleTime
            }
            else if (timerData[0]?.break_starts && !timerData[0]?.break_end) {
                console.log('breaks start but did not end')
                // we taken diff between start time and break_starts
                diffInMs = breakStartTime - startsTime - idleTime
            }
            else {
                // we take diff between current time and start time
                console.log('normal working hours')
                diffInMs = now.getTime() - startsTime - (breakEndTime - breakStartTime) - idleTime
            }

            // Calculate difference in seconds, minutes, hours, and days
            const minutes = Math.floor(diffInMs / (1000 * 60)) % 60;
            const hours = Math.floor(diffInMs / (1000 * 60 * 60)) % 24;

            // Format the difference string according to your needs
            let differenceString: string = '';
            differenceString = `${hours || '00'}:` + `${minutes < 10 ? '0' + minutes : minutes || '00'}`;

            differenceString && setStartTime(differenceString)
        }
    }

    const startTracker = async () => {
        const formattedTime = getFormatedTime();
        const formattedDate = getFormattedDate();
        const today = new Date();


        if (timerData.length) {
            // Parse the recorded time string into individual components
            const [recordedHours, recordedMinutes, seconds]: any = timerData[0]?.end.split(':').map(Number);

            // Create a Date object for the recorded time
            const recordedTime = new Date();
            recordedTime.setHours(recordedHours, recordedMinutes, seconds, 0); // Set time components, milliseconds to 0

            const idleTime = (timerData[0].idle_time + today.getTime()) - recordedTime.getTime();
            const { data, error } = await supabase
                .from('TimeLog')
                .update({ idle_time: idleTime, end: null })
                .eq('date', formattedDate)
                .eq('user_id', 1)
                .select();
            data?.length && setTimerData(data);
            data?.length && alert('tracker started')


        } else {
            const { data, error } = await supabase
                .from('TimeLog')
                .insert([
                    { date: formattedDate, start: formattedTime, user_id: 1 },
                ])
                .select()
            data?.length && setTimerData(data)
            data?.length && alert('tracker started')
        }

    }

    const addBreak = async () => {
        const formattedTime = getFormatedTime()
        const formattedDate = getFormattedDate()

        const { data, error } = await supabase
            .from('TimeLog')
            .update({ break_starts: formattedTime })
            .eq('date', formattedDate)
            .eq('user_id', 1)
            .select();

        if (!error) alert('Break Starts')
        data?.length && setTimerData(data)
    }

    const endBreak = async () => {
        const formattedTime = getFormatedTime()
        const formattedDate = getFormattedDate()

        const { data, error } = await supabase
            .from('TimeLog')
            .update({ break_end: formattedTime })
            .eq('date', formattedDate)
            .eq('user_id', 1)
            .select();

        if (!error) alert('Break End')
        data?.length && setTimerData(data)
    }

    const handlePuchOut = async () => {
        const formattedTime = getFormatedTime()
        const formattedDate = getFormattedDate()

        const { data, error } = await supabase
            .from('TimeLog')
            .update({ end: formattedTime })
            .eq('date', formattedDate)
            .eq('user_id', 1)
            .select();

        if (!error) alert('Punch Out')
        data?.length && setTimerData(data)
    }

    const handleIdleTime = async () => {
        const formattedDate = getFormattedDate();
        if (!timerData[0].end) {
            const { data, error } = await supabase
                .from('TimeLog')
                .update({ user_idle_time: MINUTE_MS + timerData[0]?.user_idle_time })
                .eq('date', formattedDate)
                .eq('user_id', 1)
                .select();

            data?.length && setTimerData(data);
            if (data?.length) {
                setIdleTime(otherTypeOfFormattedTime(data[0]?.user_idle_time))
            }
        }
    }

    //#endregion
    return (
        <div className='bg-light w-100 vh-100'>
            <Container className='py-5'>
                <h1 className='text-center'>Welcome : {userData[0].email}</h1>
                <Row className='d-flex justify-content-center flex-row text-center align-items-center my-5'>
                    <Col>
                        <h1>
                            Working Hours : {startTime}
                        </h1>
                        <h5>
                            Status : <span className={timerData[0]?.end ? 'text-danger' : 'text-success'}> {timerData[0]?.end ? 'Offline' : 'Online'}</span>
                        </h5>
                        <h6 className='text-danger'>

                            Idle time: {idleTime === '00:00' ? timerData[0]?.user_idle_time : idleTime}
                        </h6>
                    </Col>

                </Row>
                <Row lg={12} className='d-flex justify-content-center flex-row align-items-center'>
                    <Col lg={2}>
                        <Button type='button' className='btn-success' onClick={() => startTracker()}>Start</Button>
                    </Col>
                    <Col lg={2}>
                        <Button type='button' className='btn-danger' onClick={() => { timerData[0]?.break_starts !== null ? endBreak() : addBreak() }} disabled={timerData[0]?.break_end}>{timerData[0]?.break_starts !== null ? 'End Break' : 'Take A Break'}</Button>
                    </Col>
                    <Col lg={2}>
                        <Button type='button' className='btn-danger' onClick={() => handlePuchOut()} disabled={timerData[0]?.end}>Punch Out</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Tracker