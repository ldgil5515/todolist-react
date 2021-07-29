import React, { Component, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import cookie from 'react-cookies';
import axios from 'axios';
import videoSource from "../video/minecraftNature.mp4";
import { Form, Input, Button, Checkbox, Modal, message } from 'antd';
import '../signPage.css'

axios.defaults.withCredentials = true;

class SignPage extends Component {
  constructor(props){
    super(props);
    this.state={
      display: "login",
    }
  }

  loginAPI = (userid, userpw, callback) => {
    axios({
      method: 'post',
      url: "http://localhost:3001/login",
      data: {
        username: userid,
        password: userpw
      }
    }).then((response)=>{
      if(response.data.status.status){
        this.props.history.push('/');
      } else {
        callback(response.data.status.message);
      }
    })
  }

  checkDuplicate = async(userid) => {
    let isDuplicate;
    await axios({
      method: 'post',
      url: "http://localhost:3001/checkDuplicate",
      data: {
        username: userid,
      }
    }).then((response)=>{
      isDuplicate=response.data.status;
    })
    return isDuplicate;
  }

  movePage = (page) => {
    this.setState({
      display: page
    })
  }

  switchPage = (display) => {
    switch(display) {
      case 'login':
        return <LoginForm loginAPI={this.loginAPI} movePage={this.movePage}/>;
      case 'register':
        return <RegisterForm checkDuplicate={this.checkDuplicate} movePage={this.movePage}/>;
      case 'forget':
        return <ForgetUserForm checkDuplicate={this.checkDuplicate} movePage={this.movePage}/>;
      default:
        return <LoginForm loginAPI={this.loginAPI} movePage={this.movePage}/>;
    }
  }

  render(){
    return (
      <div className="signPage">
        <div className="videoContainer">
          <video autoPlay="autoplay" loop="loop" muted className="video">
            <source src={videoSource} type="video/mp4" />
          </video>
        </div>
        {this.switchPage(this.state.display)}
      </div>
    );
  }
} 

const LoginForm = (props) => {
  const [form] = Form.useForm();

  const onFinish = async(values) => {
    if(form.getFieldValue('remember')) cookie.save('rememberID', form.getFieldValue('username'), { path: '/' });
    props.loginAPI(values.username, values.password, (failMessage) => {
      switch (failMessage){
        case 'Not exists ID' :
          return form.setFields([{ name: 'username', errors: ['존재하지 않는 아이디입니다'], }]);
        case 'Wrong Password' :
          return form.setFields([{ name: 'password', errors: ['잘못된 비밀번호입니다'], }]);
        default:
          return
      }
    });
  }

  const onCheckChange = () => {
    if(cookie.load('isRemember')){
      cookie.remove('isRemember');
      cookie.remove('rememberID');
    }
    else cookie.save('isRemember', form.getFieldValue('remember'), { path: '/' });
  }

  return (
    <Form
      form={form}
      name="normal_login"
      className="login-form"
      initialValues={{ 
        username: cookie.load('rememberID')!==null?cookie.load('rememberID'):"",
        remember: cookie.load('isRemember')
      }}
      onFinish={onFinish}
    >
      <div className="login-form-desc">USERNAME</div>
      <Form.Item
        name="username"
        rules={[{required: true, message:'아이디를 입력해주세요'}]}
      >
        <Input className="username-input"/>
      </Form.Item>

      <div className="login-form-desc">PASSWORD</div>
      <Form.Item
        name="password"
        rules={[{required: true, message:'비밀번호를 입력해주세요'}]}
      >
      <Input 
        className="password-input"
        type="password"
      />
      </Form.Item>

      <Form.Item>
        <Form.Item 
          name="remember" 
          valuePropName="checked" 
          noStyle
        >
          <Checkbox 
            onChange={onCheckChange}
          >
            Remember ID
          </Checkbox>
        </Form.Item>
        <button className="cursor-pointer login-form-forgot" onClick={()=>{props.movePage("forget")}}>
          Forgot password?
        </button>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          LOG IN
        </Button>
        <div className="text-align" onClick={()=>{props.movePage("register")}}>
          <button className="cursor-pointer">REGISTER</button>
        </div>
      </Form.Item>
    </Form>
  );
};

const RegisterForm = (props) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const registerAPI = (userid, userpw, callback) => {
    axios({
      method: 'post',
      url: "http://localhost:3001/register",
      data: {
        username: userid,
        password: userpw
      }
    }).then((response)=>{
      callback(response.data.status.message);
    })
  }

  const registerOk = () => {
    registerAPI(form.getFieldValue('username'), form.getFieldValue('password'), (data)=>{
      return data;
    }); 
  };

  const isExistID = async () => {
    if(await props.checkDuplicate(form.getFieldValue('username'))) {
      return Promise.reject(new Error('이미 가입된 아이디입니다')); 
    } 
    return Promise.resolve(); 
  };

  const validateConfirmPW = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('비밀번호를 입력하세요')); 
    } 
    else if(value !== form.getFieldValue('password')){
      return Promise.reject(new Error('비밀번호가 일치하지 않습니다')); 
    }
    return Promise.resolve(); 
  };

  return (
    <Form
      form={form}
      name="normal_register"
      className="register-form"
      onFinish={()=>{setVisible(true)}}
    >
      <div className="register-form-desc">USER EMAIL</div>
      <Form.Item
        name="username"
        rules={[
          {required: true, message:'아이디를 입력해주세요'},
          {type: 'email', message:'아이디는 이메일 형식이어야합니다.'},
          {validator: isExistID}
        ]}
      >
        <Input className="username-input"/>
      </Form.Item>
      <div className="register-form-desc">PASSWORD</div>
      <Form.Item
        name="password"
        rules={[{required: true, message:'비밀번호를 입력해주세요'}]}
      >
        <Input
          className="password-input"
          type="password"
        />
      </Form.Item>
      
      <div className="register-form-desc">CONFIRM PASSWORD</div>
      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { validator: validateConfirmPW },
        ]}
      >
        <Input
          className="password-input"
          type="password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          REGISTER
        </Button>
        <div className="text-align" onClick={()=>{props.movePage("login")}}>
        <button className="cursor-pointer">{"<BACK"}</button>
        </div>
      </Form.Item>

      <ConfirmModal
        visible={visible}
        visibleChange={setVisible}
        registerOk={registerOk}
        moveLogin={()=>{props.movePage("login")}}
      />
    </Form>
  );
};

const ConfirmModal = ({ visible, visibleChange, registerOk, moveLogin }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('회원가입 하시겠습니까?');

  const handleOk = async() => {
    let failmessage;
    setModalText('회원가입 요청중.. 잠시만 기다려주세요');
    setConfirmLoading(true);

    failmessage=await registerOk();

    setTimeout(() => {
      if(failmessage==="Register Success") setModalText('회원가입 성공!');
      else { 
        setModalText(failmessage);
      }
    }, 1000);

    setTimeout(() => {
      visibleChange(false);
      setConfirmLoading(false);
      moveLogin();
    }, 2000);
  };

  return (
    <Modal
      title="회원가입 확인"
      visible={visible}
      onOk={handleOk}
      onCancel={()=>{visibleChange(false)}}
      confirmLoading={confirmLoading}
      okText="확인"
      cancelText="취소"
      centered
      className="register-confirm-form"
    >
   <p>{modalText}</p>
  </Modal>
  );
};

const ForgetUserForm = (props) => {
  const [page, setPage] = useState(false);
  const [email, setEmail] = useState('');
  const [validateCode, setValidateCode] = useState(15);

  const switchPage = (display) => {
    switch(display) {
      case 'enterEmail':
        return <ForgetEnterEmail setEmail={setEmail} checkDuplicate={props.checkDuplicate} movePage={props.movePage} setinSection={setPage}/>
      case 'enterCode':
        return <ForgetEnterCode email={email} setinSection={setPage} setValidateCode={setValidateCode}/>
      case 'resetPassword':
        return <ResetPassword email={email} validateCode={validateCode} setinSection={setPage} movePage={props.movePage}/>
      default:
        return <ForgetEnterEmail setEmail={setEmail} checkDuplicate={props.checkDuplicate} movePage={props.movePage} setinSection={setPage}/>
    }
  }

  return (
    <div>
      {switchPage(page)}
    </div>
  );
};

const ForgetEnterEmail = (props) => {
  const [form] = Form.useForm();
  const onFinish = async() => {
    if(!await props.checkDuplicate(form.getFieldValue('username'))) {
      return form.setFields([{ name: 'username', errors: ['존재하지 않는 아이디입니다'], }]);
    }
    else {
      props.setEmail(form.getFieldValue('username'));
      props.setinSection("enterCode");
    }
  }
  return (
    <Form
      form={form}
      name="normal_register"
      className="forget-form"
      onFinish={onFinish}
    >
      <div className="register-form-desc">ENTER YOUR EMAIL</div>
      <Form.Item
        name="username"
        rules={[
          { required: true, message:"인증번호를 받을 이메일을 입력해주세요" },
          { type:"email", message:"제대로 입력해주세요" },
        ]}
      >
        <Input className="username-input"/>
      </Form.Item>
    
      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          ENTER
        </Button>
        <div className="text-align" onClick={()=>{props.movePage("login")}}>
        <button className="cursor-pointer">{"<BACK"}</button>
        </div>
      </Form.Item>
    </Form>
  );
};

const ForgetEnterCode = (props) => {
  const [form] = Form.useForm();
  const [requestTime, requestTimeSet] = useState(15);
  const [timerON, settimerON] = useState(false);

  const requestCode = async(userid) => {
    let answer = {
      status: "",
      message: "",
    };

    await axios({
      method: 'post',
      url: "http://localhost:3001/forgetPassword",
      data: {
        username: userid,
      }
    }).then((response)=>{
      answer.status=response.data.status;
      answer.message=response.data.message;
    })

    return answer;
  }

  const request = async() => {
    if(requestTime!==15) return; 
    let response=await requestCode(props.email);
    form.setFields([{ 
      name: 'validateCode', 
      errors: [response.message],
    }]);
    if(!timerON) settimerON(true);
  };

  const enterCode = async(username, validateCode) => {
    let answer = {
      status: "",
      message: "",
    };
    
    await axios({
      method: 'post',
      url: "http://localhost:3001/enterCode",
      data: {
        username: username,
        validateCode: validateCode,
      }
    }).then((response)=>{
      answer.status=response.data.status;
      answer.message=response.data.message;
    })

    return answer;
  }

  const enterButton = async() => {
    let answer=await enterCode(props.email, form.getFieldValue('validateCode'));

    if(answer.status){
      props.setValidateCode(form.getFieldValue('validateCode'));
      props.setinSection("resetPassword");
    }
    else {
      form.setFields([{ 
        name: 'validateCode', 
        errors: [answer.message],
      }]);
    }
  }; 

  useEffect(() => {
    const countdown = setInterval(() => {
      if(requestTime===0) {
        clearInterval(countdown);
        requestTimeSet(15);
        settimerON(false);
      }
      else if(timerON) requestTimeSet(requestTime-1);
    }, 1000);
    return () => {
      clearInterval(countdown);      
    }
  }, [requestTime, timerON]);

  return (
    <Form
      form={form}
      name="normal_register"
      className="enterCode-form"
      onFinish={enterButton}
    >
      <div className="register-form-desc">ENTER CODE</div>
      <Form.Item
        name="validateCode"
        rules={[
          { required: true, message: ['인증코드를 입력하세요'] }
        ]}
      >
        <Input className="username-input"/>
      </Form.Item>
      <Button type="primary" className="codeRequest-buttom-form" onClick={request}>
          {requestTime===15?"REQUEST":requestTime}
      </Button>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="submit-form-button">
          ENTER
        </Button>
      </Form.Item>
        <div className="text-align" onClick={()=>{props.setinSection("enterEmail")}}>
          <button className="cursor-pointer">{"<BACK"}</button>
        </div>
    </Form>
  );
};

const ResetPassword = (props) => {
  const [form] = Form.useForm();

  const resetPassword = async(username, validateCode, newPassword) => {
    let answer = {
      status: "",
      message: "",
    };
    
    await axios({
      method: 'post',
      url: "http://localhost:3001/resetPassword",
      data: {
        username: username,
        validateCode: validateCode,
        newPassword: newPassword,
      }
    }).then((response)=>{
      answer.status=response.data.status;
      answer.message=response.data.message;
    })

    return answer;
  }

  const enterButton = async() => {
    let answer=await resetPassword(props.email, props.validateCode, form.getFieldValue('newPassword'));

    if(answer.status){
      message.success('비밀번호가 변경되었습니다');
      props.movePage("login");
    }
    else {
      form.setFields([{ 
        name: 'newPassword', 
        errors: [answer.message],
      }]);
    }
  };

  return (
    <Form
      form={form}
      name="normal_register"
      className="resetPassword-form"
    >
      <div className="register-form-desc">Enter new password</div>
      <Form.Item
        name="newPassword"
        rules={[
          { required: true, message: ['새로운 비밀번호를 입력해주세요'] }
        ]}
      >
        <Input className="newPassword-input" type="password"/>
      </Form.Item>
      <Form.Item>
        <Button type="primary" className="submit-form-button" onClick={enterButton}>
          ENTER
        </Button>
      </Form.Item>

      <div className="text-align" onClick={()=>{props.movePage("login")}}>
        <button className="cursor-pointer">{"<BACK"}</button>
        </div>
    </Form>
  );
};

export default withRouter(SignPage)