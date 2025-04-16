import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  InputNumber,
  Alert,
  Row,
  Col,
  notification,
  Button,
  Space,
  Progress,
  Divider,
  Tooltip
} from 'antd';
import {
  WalletOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Budget, Trip, Destination } from '@/models/travel';
import { calculateTotalBudget, formatCurrency, getDestinationById } from '@/utils/travel';
import styles from './index.less';

const { Title, Text } = Typography;

interface BudgetManagerProps {
  trip: Trip;
  destinations: Destination[];
  onChange: (budget: Budget) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({
  trip,
  destinations,
  onChange,
}) => {
  const [totalDestinationsPrice, setTotalDestinationsPrice] = useState(0);
  const [localBudget, setLocalBudget] = useState<Budget>(() => ({...trip.budget}));
  const [hasChanges, setHasChanges] = useState(false);
  
  const totalBudget = calculateTotalBudget(trip.budget);
  const localTotalBudget = calculateTotalBudget(localBudget);
  
  // Cập nhật localBudget khi trip.budget thay đổi từ bên ngoài
  useEffect(() => {
    setLocalBudget({...trip.budget});
    setHasChanges(false);
  }, [trip.id, trip.budget]);
  
  // Calculate total price of all destinations in the trip
  useEffect(() => {
    let total = 0;
    
    trip.items.forEach((item) => {
      const destination = getDestinationById(destinations, item.destinationId);
      if (destination) {
        total += destination.price;
      }
    });
    
    setTotalDestinationsPrice(total);
  }, [trip.items, destinations]);
  
  // Tính phần trăm của mỗi hạng mục
  const calculateCategoryPercentages = () => {
    if (localTotalBudget <= 0) return {};
    
    return {
      food: Math.round((localBudget.food / localTotalBudget) * 100),
      accommodation: Math.round((localBudget.accommodation / localTotalBudget) * 100),
      transportation: Math.round((localBudget.transportation / localTotalBudget) * 100),
      activities: Math.round((localBudget.activities / localTotalBudget) * 100),
      other: Math.round((localBudget.other / localTotalBudget) * 100),
    };
  };
  
  const categoryPercentages = calculateCategoryPercentages();

  const handleLocalBudgetChange = (category: keyof Budget, value: number | null) => {
    const updatedBudget = {
      ...localBudget,
      [category]: value || 0,
    };
    
    setLocalBudget(updatedBudget);
    setHasChanges(true);
  };
  
  const handleSaveBudget = () => {
    onChange(localBudget);
    setHasChanges(false);
    
    // Kiểm tra và thông báo nếu ngân sách thấp hơn chi phí điểm đến
    const newTotalBudget = calculateTotalBudget(localBudget);
    const isBudgetInsufficient = newTotalBudget < totalDestinationsPrice;
    
    if (isBudgetInsufficient && newTotalBudget > 0) {
      notification.warning({
        message: 'Cảnh báo ngân sách',
        description: `Ngân sách của bạn (${formatCurrency(newTotalBudget)}) thấp hơn tổng chi phí các điểm đến (${formatCurrency(totalDestinationsPrice)})!`,
        duration: 5,
      });
    } else {
      notification.success({
        message: 'Đã lưu ngân sách',
        description: 'Ngân sách của bạn đã được cập nhật thành công',
        duration: 2,
      });
    }
  };
  
  const handleAutoBudget = () => {
    // Phân bổ ngân sách tự động dựa trên chi phí điểm đến
    // Thêm 20% vào tổng chi phí điểm đến để có buffer
    const baseTotal = Math.max(totalDestinationsPrice * 1.2, 1000000);
    
    // Tự động phân bổ ngân sách với tỷ lệ cố định
    const newBudget = {
      food: Math.round(baseTotal * 0.3), // 30% cho ăn uống
      accommodation: Math.round(baseTotal * 0.4), // 40% cho lưu trú
      transportation: Math.round(baseTotal * 0.15), // 15% cho di chuyển
      activities: Math.round(baseTotal * 0.1), // 10% cho hoạt động
      other: Math.round(baseTotal * 0.05), // 5% cho chi phí khác
    };
    
    // Cập nhật ngân sách local và lưu luôn
    setLocalBudget(newBudget);
    onChange(newBudget);
    setHasChanges(false);
    
    notification.success({
      message: 'Thiết lập ngân sách tự động',
      description: `Đã phân bổ ngân sách dựa trên chi phí điểm đến với thêm 20% dự phòng.`,
      duration: 4,
    });
  };

  // Prepare chart data
  const chartSeries = [
    localBudget.food,
    localBudget.accommodation,
    localBudget.transportation,
    localBudget.activities,
    localBudget.other,
  ];
  
  const chartOptions: ApexOptions = {
    labels: ['Ăn uống', 'Lưu trú', 'Di chuyển', 'Hoạt động', 'Khác'],
    colors: ['#1890ff', '#52c41a', '#722ed1', '#faad14', '#f5222d'],
    legend: {
      position: 'bottom',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const getBudgetStatus = () => {
    if (totalBudget === 0) return 'empty';
    if (totalBudget < totalDestinationsPrice) return 'insufficient';
    return 'sufficient';
  };

  const renderBudgetStatusAlert = () => {
    const status = getBudgetStatus();
    
    if (status === 'empty') {
      return (
        <Alert
          message="Chưa có ngân sách"
          description="Hãy điều chỉnh ngân sách cho chuyến đi của bạn rồi bấm Cập nhật để lưu lại."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className={styles.budgetAlert}
          action={
            <Button size="small" type="primary" onClick={handleAutoBudget}>
              Thiết lập tự động
            </Button>
          }
        />
      );
    } else if (status === 'insufficient') {
      return (
        <Alert
          message="Cảnh báo ngân sách"
          description={`Ngân sách hiện tại (${formatCurrency(totalBudget)}) thấp hơn tổng chi phí các điểm đến (${formatCurrency(totalDestinationsPrice)})!`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className={styles.budgetAlert}
          action={
            <Button size="small" type="primary" onClick={handleAutoBudget}>
              Điều chỉnh tự động
            </Button>
          }
        />
      );
    } else {
      return (
        <Alert
          message="Ngân sách hợp lý"
          description={`Ngân sách hiện tại (${formatCurrency(totalBudget)}) đủ để chi trả cho các điểm đến đã chọn (${formatCurrency(totalDestinationsPrice)}).`}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          className={styles.budgetAlert}
        />
      );
    }
  };

  return (
    <div className={styles.budgetContainer}>
      <Title level={4}>
        <WalletOutlined style={{ marginRight: 8 }} />
        Quản lý ngân sách
      </Title>

      {renderBudgetStatusAlert()}

      <Card 
        title="Chi phí các hạng mục" 
        bordered={false} 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Tooltip title="Thiết lập ngân sách tự động dựa trên chi phí điểm đến">
              <Button 
                icon={<SyncOutlined />} 
                onClick={handleAutoBudget}
                type="default"
              >
                Tự động
              </Button>
            </Tooltip>
            <Button 
              type="primary" 
              onClick={handleSaveBudget} 
              disabled={!hasChanges}
            >
              Cập nhật
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 24]}>
          <Col xs={24} sm={12} md={8} lg={12}>
            <Text>Ăn uống</Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '100%', marginTop: 8 }}
                min={0}
                step={100000}
                value={localBudget.food}
                onChange={(value) => handleLocalBudgetChange('food', value)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
                addonAfter="VND"
              />
              {categoryPercentages.food > 0 && (
                <Progress 
                  percent={categoryPercentages.food} 
                  size="small" 
                  status="active" 
                  strokeColor="#1890ff"
                />
              )}
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8} lg={12}>
            <Text>Lưu trú</Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '100%', marginTop: 8 }}
                min={0}
                step={100000}
                value={localBudget.accommodation}
                onChange={(value) => handleLocalBudgetChange('accommodation', value)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
                addonAfter="VND"
              />
              {categoryPercentages.accommodation > 0 && (
                <Progress 
                  percent={categoryPercentages.accommodation} 
                  size="small" 
                  status="active" 
                  strokeColor="#52c41a"
                />
              )}
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8} lg={12}>
            <Text>Di chuyển</Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '100%', marginTop: 8 }}
                min={0}
                step={100000}
                value={localBudget.transportation}
                onChange={(value) => handleLocalBudgetChange('transportation', value)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
                addonAfter="VND"
              />
              {categoryPercentages.transportation > 0 && (
                <Progress 
                  percent={categoryPercentages.transportation} 
                  size="small" 
                  status="active" 
                  strokeColor="#722ed1"
                />
              )}
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8} lg={12}>
            <Text>Hoạt động</Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '100%', marginTop: 8 }}
                min={0}
                step={100000}
                value={localBudget.activities}
                onChange={(value) => handleLocalBudgetChange('activities', value)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
                addonAfter="VND"
              />
              {categoryPercentages.activities > 0 && (
                <Progress 
                  percent={categoryPercentages.activities} 
                  size="small" 
                  status="active" 
                  strokeColor="#faad14"
                />
              )}
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8} lg={12}>
            <Text>Khác</Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '100%', marginTop: 8 }}
                min={0}
                step={100000}
                value={localBudget.other}
                onChange={(value) => handleLocalBudgetChange('other', value)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\s?|(,*)/g, ''))}
                addonAfter="VND"
              />
              {categoryPercentages.other > 0 && (
                <Progress 
                  percent={categoryPercentages.other} 
                  size="small" 
                  status="active" 
                  strokeColor="#f5222d"
                />
              )}
            </Space>
          </Col>
        </Row>
        
        {hasChanges && (
          <Alert
            style={{ marginTop: 16 }}
            message="Bạn có thay đổi chưa lưu"
            description="Bấm nút Cập nhật để lưu các thay đổi ngân sách của bạn"
            type="info"
            showIcon
            action={
              <Button size="small" type="primary" onClick={handleSaveBudget}>
                Cập nhật
              </Button>
            }
          />
        )}

        <Divider />
        
        <div className={styles.totalBudget}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>Chi phí điểm đến:</Text> <Text>{formatCurrency(totalDestinationsPrice)}</Text>
            </div>
            <div>
              <Text strong>Tổng ngân sách hiện tại:</Text> <Text>{formatCurrency(totalBudget)}</Text>
            </div>
            {hasChanges && (
              <div>
                <Text strong>Ngân sách mới (chưa lưu):</Text> <Text>{formatCurrency(localTotalBudget)}</Text>
              </div>
            )}
            {totalBudget > 0 && totalDestinationsPrice > 0 && (
              <div>
                <Text strong>Trạng thái:</Text> 
                <Text type={totalBudget >= totalDestinationsPrice ? "success" : "danger"}>
                  {totalBudget >= totalDestinationsPrice
                    ? ` Đủ (dư ${formatCurrency(totalBudget - totalDestinationsPrice)})`
                    : ` Thiếu (cần thêm ${formatCurrency(totalDestinationsPrice - totalBudget)})`}
                </Text>
              </div>
            )}
          </Space>
        </div>
      </Card>

      {localTotalBudget > 0 && (
        <Card title="Phân bổ ngân sách" bordered={false} style={{ marginTop: 16 }}>
          <div className={styles.chartContainer}>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="pie"
              height={350}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default BudgetManager; 