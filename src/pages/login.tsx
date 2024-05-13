import { Col, Container, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { supabase } from '../App';
import { useState } from 'react';
interface props {
    callBack: (data: any) => void
}
const Login = ({ callBack }: props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const verifyUser = async () => {
        const { data, error } = await supabase
            .from('User')
            .select('email, password')
            .eq('email', email)
            .eq('password', password)
        data?.length && localStorage.setItem('userData', JSON.stringify(data))
        data?.length && callBack(data)
        data?.length ? alert('Login Successfull') : alert('Unathorized')
    }

    return (
        <Container className='w-100 '>
            <Row lg={12} className='d-flex justify-content-center align-items-center my-5' >
                <Col lg={4}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={(event) => setEmail(event.target.value)} // Update email state on change
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={(event) => setPassword(event.target.value)} // Update password state on change
                            />
                        </Form.Group>
                        <Button variant="primary" type="button" onClick={() => { verifyUser() }}>
                            Login
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>

    );
}

export default Login;