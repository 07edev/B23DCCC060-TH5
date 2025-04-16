import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Space, Upload, Typography, InputNumber, Select, message, Tabs, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LineChartOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';
import { Destination, DestinationType, Trip } from '@/models/travel';
import { formatCurrency } from '@/utils/travel';
import styles from './index.less';
import type { RcFile } from 'antd/es/upload/interface';
import moment from 'moment';
import 'moment/locale/vi';

const { Text, Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface AdminPanelProps {
  destinations: Destination[];
  trips: Trip[];
  onAddDestination: (destination: Destination) => void;
  onUpdateDestination: (destination: Destination) => void;
  onDeleteDestination: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  destinations,
  trips = [],
  onAddDestination,
  onUpdateDestination,
  onDeleteDestination,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [previewImage, setPreviewImage] = useState('');
  const [localDestinations, setLocalDestinations] = useState<Destination[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('destinations');

  // Cập nhật localDestinations khi props destinations thay đổi
  useEffect(() => {
    setLocalDestinations(destinations);
  }, [destinations]);

  const showAddModal = () => {
    setEditingDestination(null);
    setPreviewImage('');
    setFileList([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (destination: Destination) => {
    setEditingDestination(destination);
    setPreviewImage(destination.image);
    setFileList([]);
    form.setFieldsValue({
      ...destination,
      // Đảm bảo giá trị number đúng kiểu
      price: typeof destination.price === 'string' ? 
        parseInt(destination.price.toString().replace(/[^\d]/g, '')) : 
        destination.price,
      rating: destination.rating
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingDestination(null);
    setPreviewImage('');
    setFileList([]);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Chuyển đổi giá trị price từ string sang number nếu cần
      const price = typeof values.price === 'string' ? 
        parseInt(values.price.replace(/[^\d]/g, '')) : 
        values.price;

      const newDestination: Destination = {
        id: editingDestination?.id || `dest-${Date.now()}`,
        ...values,
        price: price,
        image: previewImage || 'https://via.placeholder.com/300',
      };

      console.log('Destination data to save:', newDestination);

      // Cập nhật localDestinations trước để hiển thị ngay lập tức
      let updatedDestinations: Destination[] = [];
      
      if (editingDestination) {
        updatedDestinations = localDestinations.map(item => 
          item.id === newDestination.id ? newDestination : item
        );
        setLocalDestinations(updatedDestinations);
        onUpdateDestination(newDestination);
        message.success('Đã cập nhật điểm đến thành công');
      } else {
        updatedDestinations = [...localDestinations, newDestination];
        setLocalDestinations(updatedDestinations);
        onAddDestination(newDestination);
        message.success('Đã thêm điểm đến mới thành công');
      }
      
      // Force cập nhật trạng thái của component để hiển thị điểm đến mới
      setTimeout(() => {
        // Chuyển tab để kích hoạt render lại
        setActiveTab('destinations');
        
        // Nếu đang ở tab thống kê, cần cập nhật lại danh sách top rated
        if (activeTab === 'statistics') {
          setActiveTab('statistics');
        }
      }, 100);

      setIsModalVisible(false);
      setEditingDestination(null);
      setPreviewImage('');
      setFileList([]);
      form.resetFields();
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa điểm đến này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        // Cập nhật localDestinations trước để hiển thị ngay lập tức
        const updatedList = localDestinations.filter(item => item.id !== id);
        setLocalDestinations(updatedList);
        onDeleteDestination(id);
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewImage(e.target.value);
  };

  // Xử lý upload file từ máy tính
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file hình ảnh!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 2MB!');
      return false;
    }

    // Đọc file và hiển thị preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    
    setFileList([file]);
    return false; // Ngăn không cho tự động upload
  };

  // Tính toán số lượng chuyến đi theo tháng
  const calculateTripsByMonth = () => {
    const monthlyCounts: { month: string, count: number }[] = [];
    
    // Tạo mảng 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months');
      monthlyCounts.push({
        month: month.format('MM/YYYY'),
        count: 0
      });
    }
    
    // Đảm bảo trips là mảng hợp lệ
    if (!Array.isArray(trips)) {
      console.warn('trips is not an array:', trips);
      return monthlyCounts;
    }
    
    // In ra để debug
    console.log('Calculating trips by month. Total trips:', trips.length);
    
    // Đếm số chuyến đi trong mỗi tháng
    trips.forEach(trip => {
      if (trip && trip.startDate) {
        const tripMonth = moment(trip.startDate).format('MM/YYYY');
        console.log(`Trip ${trip.id} has startDate: ${trip.startDate}, month: ${tripMonth}`);
        
        const monthIndex = monthlyCounts.findIndex(m => m.month === tripMonth);
        if (monthIndex !== -1) {
          monthlyCounts[monthIndex].count += 1;
          console.log(`Incrementing count for month ${tripMonth} to ${monthlyCounts[monthIndex].count}`);
        }
      } else {
        console.log('Skipping trip with no startDate:', trip);
      }
    });
    
    console.log('Final monthly counts:', monthlyCounts);
    return monthlyCounts;
  };

  // Tìm các điểm đến phổ biến nhất
  const findPopularDestinations = () => {
    // Đảm bảo trips là mảng hợp lệ
    if (!Array.isArray(trips)) {
      console.warn('trips is not an array:', trips);
      return [];
    }
    
    console.log('Finding popular destinations. Total trips:', trips.length);
    
    const destinationCounts: { [id: string]: number } = {};
    
    // Đếm số lần mỗi điểm đến được sử dụng trong tất cả các chuyến đi
    trips.forEach(trip => {
      if (trip && Array.isArray(trip.items)) {
        trip.items.forEach(item => {
          if (item && item.destinationId) {
            if (destinationCounts[item.destinationId]) {
              destinationCounts[item.destinationId] += 1;
            } else {
              destinationCounts[item.destinationId] = 1;
            }
          }
        });
      }
    });
    
    // In ra để debug
    console.log('Destination counts:', destinationCounts);
    
    // Chuyển đổi thành mảng và sắp xếp theo số lượt sử dụng
    const popularDestinations = Object.entries(destinationCounts)
      .map(([id, count]) => {
        const destination = destinations.find(d => d.id === id);
        return {
          id,
          name: destination?.name || 'Không xác định',
          count,
          image: destination?.image || 'https://via.placeholder.com/60x60?text=?',
          price: destination?.price || 0,
          rating: destination?.rating || 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Lấy 5 điểm đến phổ biến nhất
    
    console.log('Popular destinations:', popularDestinations);
    return popularDestinations;
  };

  // Tìm các điểm đến được đánh giá cao nhất
  const findTopRatedDestinations = () => {
    // Đảm bảo destinations là mảng hợp lệ
    if (!Array.isArray(destinations) || destinations.length === 0) {
      console.warn('No valid destinations found:', destinations);
      return [];
    }
    
    const topRated = [...destinations]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5); // Lấy 5 điểm đến được đánh giá cao nhất
    
    console.log('Top rated destinations:', topRated);
    return topRated;
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
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const renderStatistics = () => {
    const monthlyTrips = calculateTripsByMonth();
    const popularDestinations = findPopularDestinations();
    const topRatedDestinations = findTopRatedDestinations();
    const totalTrips = Array.isArray(trips) ? trips.length : 0;
    const totalDestinations = Array.isArray(destinations) ? destinations.length : 0;

    return (
      <div className={styles.statisticsContainer}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title={<div><BarChartOutlined /> Số lượt tạo lịch trình theo tháng</div>}>
              {totalTrips > 0 ? (
                <div className={styles.monthlyStats}>
                  {monthlyTrips.map((item, index) => (
                    <div key={index} className={styles.monthStat}>
                      <div className={styles.monthLabel}>{item.month}</div>
                      <div className={styles.monthBar} style={{ height: `${Math.max(item.count * 20, 10)}px` }}>
                        {item.count > 0 && <span className={styles.countBadge}>{item.count}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noData}>
                  <p>Chưa có lịch trình nào được tạo</p>
                  <p>Các lịch trình du lịch đã lưu sẽ hiển thị ở đây</p>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              title={<div><TrophyOutlined /> Điểm đến phổ biến nhất</div>}
              className={styles.popularDestinationsCard}
            >
              {popularDestinations.length > 0 ? (
                <ul className={styles.popularList}>
                  {popularDestinations.map((item, index) => (
                    <li key={item.id} className={styles.popularItem}>
                      <div className={styles.popularRank}>{index + 1}</div>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className={styles.popularImage}
                      />
                      <div className={styles.popularInfo}>
                        <div className={styles.popularName}>{item.name}</div>
                        <div className={styles.popularCount}>{item.count} lượt sử dụng</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.noData}>
                  <p>Chưa có điểm đến nào được sử dụng</p>
                  <p>Thêm điểm đến vào lịch trình của bạn để xem thống kê ở đây</p>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              title={<div><LineChartOutlined /> Điểm đến đánh giá cao nhất</div>}
              className={styles.topRatedCard}
            >
              {topRatedDestinations.length > 0 ? (
                <ul className={styles.topRatedList}>
                  {topRatedDestinations.map((item, index) => (
                    <li key={item.id} className={styles.topRatedItem}>
                      <div className={styles.topRatedRank}>{index + 1}</div>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className={styles.topRatedImage}
                      />
                      <div className={styles.topRatedInfo}>
                        <div className={styles.topRatedName}>{item.name}</div>
                        <div className={styles.topRatedRating}>
                          {item.rating} / 5 ★
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.noData}>
                  <p>Chưa có điểm đến nào trong hệ thống</p>
                  <p>Thêm điểm đến mới để xem xếp hạng đánh giá ở đây</p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className={styles.adminContainer}>
      <Tabs defaultActiveKey="destinations" onChange={(key) => setActiveTab(key)}>
        <TabPane tab="Quản lý điểm đến" key="destinations">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h4>Danh sách điểm đến</h4>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Thêm điểm đến
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={localDestinations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Thống kê" key="statistics">
          {renderStatistics()}
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
              parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {previewImage && (
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={previewImage}
                    alt="Xem trước"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
                  />
                </div>
              )}
              
              <div style={{ marginBottom: 16, width: '100%' }}>
                <Text strong>Tải ảnh từ máy tính:</Text>
                <Upload
                  accept="image/*"
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  onRemove={() => {
                    setFileList([]);
                    setPreviewImage('');
                  }}
                  maxCount={1}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh từ máy tính</Button>
                </Upload>
              </div>
              
              <div style={{ width: '100%' }}>
                <Text strong>Hoặc nhập URL hình ảnh:</Text>
                <Input 
                  placeholder="Nhập URL hình ảnh" 
                  value={previewImage}
                  onChange={handleImageChange}
                  style={{ marginTop: 8 }}
                />
              </div>
              
              <Text type="secondary" style={{ marginTop: 8 }}>
                Nếu không chọn ảnh, hệ thống sẽ sử dụng ảnh mặc định.
              </Text>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPanel; 