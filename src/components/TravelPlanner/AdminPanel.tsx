import React, { useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Row,
  Col,
  Card,
  Statistic,
  Tabs,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  StarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Destination, DestinationType } from '@/models/travel';
import { formatCurrency } from '@/utils/travel';
import styles from './index.less';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface AdminPanelProps {
  destinations: Destination[];
  onAddDestination: (destination: Destination) => void;
  onUpdateDestination: (destination: Destination) => void;
  onDeleteDestination: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  destinations,
  onAddDestination,
  onUpdateDestination,
  onDeleteDestination,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [previewImage, setPreviewImage] = useState('');

  // Mock statistics data
  const monthlyTrips = [
    { month: 'Jan', count: 23 },
    { month: 'Feb', count: 34 },
    { month: 'Mar', count: 45 },
    { month: 'Apr', count: 56 },
    { month: 'May', count: 78 },
    { month: 'Jun', count: 90 },
    { month: 'Jul', count: 85 },
    { month: 'Aug', count: 65 },
    { month: 'Sep', count: 40 },
    { month: 'Oct', count: 30 },
    { month: 'Nov', count: 48 },
    { month: 'Dec', count: 67 },
  ];

  const popularDestinations = destinations
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const showAddModal = () => {
    setEditingDestination(null);
    setPreviewImage('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (destination: Destination) => {
    setEditingDestination(destination);
    setPreviewImage(destination.image);
    form.setFieldsValue(destination);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingDestination(null);
    setPreviewImage('');
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newDestination: Destination = {
        id: editingDestination?.id || `dest-${Date.now()}`,
        ...values,
        image: previewImage || 'https://via.placeholder.com/300',
      };

      if (editingDestination) {
        onUpdateDestination(newDestination);
      } else {
        onAddDestination(newDestination);
      }

      setIsModalVisible(false);
      setEditingDestination(null);
      setPreviewImage('');
      form.resetFields();
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa điểm đến này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => onDeleteDestination(id),
    });
  };

  const handleImageUpload = (file: RcFile) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    return false; // Prevent upload
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (text: string) => (
        <img
          src={text}
          alt="Điểm đến"
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại hình',
      dataIndex: 'type',
      key: 'type',
      render: (type: DestinationType) => {
        switch (type) {
          case DestinationType.BEACH:
            return 'Biển';
          case DestinationType.MOUNTAIN:
            return 'Núi';
          case DestinationType.CITY:
            return 'Thành phố';
          default:
            return 'Khác';
        }
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Destination) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  // Chart options for monthly trips
  const monthlyChartOptions: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: monthlyTrips.map((item) => item.month),
    },
    yaxis: {
      title: {
        text: 'Số lượng chuyến đi',
      },
    },
    colors: ['#1890ff'],
  };

  const monthlyChartSeries = [
    {
      name: 'Chuyến đi',
      data: monthlyTrips.map((item) => item.count),
    },
  ];

  // Chart options for popular destinations
  const popularChartOptions: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: popularDestinations.map((item) => item.name),
    },
    colors: ['#52c41a'],
  };

  const popularChartSeries = [
    {
      name: 'Đánh giá',
      data: popularDestinations.map((item) => item.rating),
    },
  ];

  return (
    <div className={styles.adminContainer}>
      <Tabs defaultActiveKey="destinations">
        <TabPane
          tab={
            <span>
              <EditOutlined />
              Quản lý điểm đến
            </span>
          }
          key="destinations"
        >
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4}>Quản lý điểm đến</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm điểm đến
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={destinations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <BarChartOutlined />
              Thống kê
            </span>
          }
          key="statistics"
        >
          <Title level={4}>Thống kê</Title>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className={styles.statsCard}>
                <Statistic
                  title="Tổng số điểm đến"
                  value={destinations.length}
                  prefix={<PlusOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className={styles.statsCard}>
                <Statistic
                  title="Đánh giá trung bình"
                  value={
                    destinations.reduce((sum, dest) => sum + dest.rating, 0) / destinations.length
                  }
                  precision={1}
                  prefix={<StarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className={styles.statsCard}>
                <Statistic
                  title="Điểm đến biển"
                  value={destinations.filter((d) => d.type === DestinationType.BEACH).length}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className={styles.statsCard}>
                <Statistic
                  title="Điểm đến núi"
                  value={destinations.filter((d) => d.type === DestinationType.MOUNTAIN).length}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="Số lượng chuyến đi theo tháng">
                <Chart
                  options={monthlyChartOptions}
                  series={monthlyChartSeries}
                  type="bar"
                  height={350}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Điểm đến phổ biến (theo đánh giá)">
                <Chart
                  options={popularChartOptions}
                  series={popularChartSeries}
                  type="bar"
                  height={350}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      <Modal
        title={editingDestination ? 'Chỉnh sửa điểm đến' : 'Thêm điểm đến mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingDestination ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Tên điểm đến"
            rules={[{ required: true, message: 'Vui lòng nhập tên điểm đến' }]}
          >
            <Input placeholder="Nhập tên điểm đến" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại hình"
            rules={[{ required: true, message: 'Vui lòng chọn loại hình' }]}
          >
            <Select placeholder="Chọn loại hình">
              <Option value={DestinationType.BEACH}>Biển</Option>
              <Option value={DestinationType.MOUNTAIN}>Núi</Option>
              <Option value={DestinationType.CITY}>Thành phố</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VND)"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={100000}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
            />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập đánh giá' }]}
          >
            <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả điểm đến" />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <div className={styles.uploadContainer}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={handleImageUpload}
              >
                {previewImage ? (
                  <img src={previewImage} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPanel; 