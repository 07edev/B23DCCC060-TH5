import React, { useEffect } from 'react';
import { history, useDispatch } from 'umi';
import { Layout, Menu, Typography, Affix } from 'antd';
import {
  CompassOutlined,
  CalendarOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import styles from './index.less';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface TravelPlannerProps {
  children: React.ReactNode;
  location: {
    pathname: string;
  };
}

const TravelPlanner: React.FC<TravelPlannerProps> = ({ children, location }) => {
  const dispatch = useDispatch();
  const { pathname } = location;

  useEffect(() => {
    // Initialize the destinations when component mounts
    dispatch({
      type: 'travel/fetchDestinations',
    });
  }, [dispatch]);

  const selectedKey = () => {
    if (pathname.includes('/travel-planner/trip')) {
      return '2';
    }
    if (pathname.includes('/travel-planner/admin')) {
      return '3';
    }
    return '1';
  };

  const handleMenuClick = (e: any) => {
    switch (e.key) {
      case '1':
        history.push('/travel-planner/home');
        break;
      case '2':
        history.push('/travel-planner/trip');
        break;
      case '3':
        history.push('/travel-planner/admin');
        break;
      default:
        history.push('/travel-planner/home');
    }
  };

  return (
    <Layout className={styles.layout}>
      <Affix>
        <Header className={styles.header}>
          <div className={styles.logo} onClick={() => history.push('/travel-planner/home')}>
            <HomeOutlined className={styles.logoIcon} />
            <Title level={4} className={styles.logoText}>
              Travel Planner
            </Title>
          </div>
        </Header>
      </Affix>
      
      <Layout>
        <Sider
          width={250}
          theme="light"
          breakpoint="lg"
          collapsedWidth={0}
          className={styles.sider}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey()]}
            style={{ height: '100%' }}
            onClick={handleMenuClick}
          >
            <Menu.Item key="1" icon={<CompassOutlined />}>
              Khám phá điểm đến
            </Menu.Item>
            <Menu.Item key="2" icon={<CalendarOutlined />}>
              Lập kế hoạch du lịch
            </Menu.Item>
            <Menu.Item key="3" icon={<SettingOutlined />}>
              Trang quản trị
            </Menu.Item>
          </Menu>
        </Sider>
        
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default TravelPlanner; 