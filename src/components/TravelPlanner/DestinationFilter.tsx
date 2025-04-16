import React from 'react';
import { Form, Select, Slider, Rate, Row, Col, Typography, Button } from 'antd';
import { DestinationType } from '@/models/travel';
import styles from './index.less';

const { Option } = Select;
const { Title } = Typography;

interface FilterValues {
  type?: DestinationType;
  priceRange: [number, number];
  rating?: number;
  sortBy?: string;
}

interface DestinationFilterProps {
  onFilter: (values: FilterValues) => void;
  initialValues?: FilterValues;
}

const DEFAULT_FILTER_VALUES: FilterValues = {
  priceRange: [0, 3000000],
  sortBy: 'rating_desc',
};

const DestinationFilter: React.FC<DestinationFilterProps> = ({
  onFilter,
  initialValues = DEFAULT_FILTER_VALUES,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: FilterValues) => {
    onFilter(values);
  };

  const handleReset = () => {
    form.resetFields();
    onFilter(DEFAULT_FILTER_VALUES);
  };

  return (
    <div className={styles.filterContainer}>
      <Title level={4} className={styles.filterTitle}>
        Lọc điểm đến
      </Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Loại hình du lịch" name="type">
              <Select placeholder="Chọn loại hình" allowClear>
                <Option value={DestinationType.BEACH}>Biển</Option>
                <Option value={DestinationType.MOUNTAIN}>Núi</Option>
                <Option value={DestinationType.CITY}>Thành phố</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Đánh giá" name="rating">
              <Rate allowHalf />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Sắp xếp theo" name="sortBy">
              <Select placeholder="Sắp xếp theo">
                <Option value="price_asc">Giá tăng dần</Option>
                <Option value="price_desc">Giá giảm dần</Option>
                <Option value="rating_desc">Đánh giá cao nhất</Option>
                <Option value="rating_asc">Đánh giá thấp nhất</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Áp dụng
              </Button>
              <Button onClick={handleReset}>Đặt lại</Button>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item label="Khoảng giá (VND)" name="priceRange">
              <Slider
                range
                min={0}
                max={3000000}
                step={100000}
                tipFormatter={(value) => `${value.toLocaleString('vi-VN')} VND`}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default DestinationFilter; 