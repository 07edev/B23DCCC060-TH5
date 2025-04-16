import React, { useState, useEffect } from 'react';
import {
  Typography,
  Tabs,
  Card,
  Button,
  DatePicker,
  Input,
  Empty,
  List,
  Space,
  Spin,
  Modal,
  Select,
  Row,
  Col,
  message,
} from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Destination, Trip, TripItem } from '@/models/travel';
import {
  calculateTravelTime,
  formatCurrency,
  generateDatesArray,
  generateItemId,
  getDestinationById,
  getTripItemsByDate,
} from '@/utils/travel';
import styles from './index.less';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface TripItineraryProps {
  trip: Trip;
  destinations: Destination[];
  loading: boolean;
  onChange: (updatedTrip: Trip) => void;
}

const TripItinerary: React.FC<TripItineraryProps> = ({
  trip,
  destinations,
  loading,
  onChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<any>(null);
  const [localDates, setLocalDates] = useState<string[]>([]);
  const [isDateConfirmed, setIsDateConfirmed] = useState(trip.startDate !== '' && trip.endDate !== '');

  // Tạo mảng ngày cục bộ khi trip.startDate và trip.endDate thay đổi
  useEffect(() => {
    if (trip.startDate && trip.endDate) {
      const newDates = generateDatesArray(trip.startDate, trip.endDate);
      setLocalDates(newDates);
      setIsDateConfirmed(true);
      console.log('Trip dates changed, new local dates:', newDates);
    } else {
      setLocalDates([]);
      setIsDateConfirmed(false);
      console.log('Trip dates reset, clearing local dates');
    }
  }, [trip.startDate, trip.endDate]);

  const handleDateRangeChange = (dates: any) => {
    console.log('Date range changed:', dates);
    setSelectedDates(dates);
  };

  const handleDateConfirm = () => {
    console.log('Confirming dates:', selectedDates);
    if (selectedDates && selectedDates.length === 2) {
      const startDate = selectedDates[0].format('YYYY-MM-DD');
      const endDate = selectedDates[1].format('YYYY-MM-DD');
      
      console.log('Formatted dates:', startDate, endDate);
      
      // Cập nhật trip
      onChange({
        ...trip,
        startDate,
        endDate,
      });

      // Cập nhật localDates mà không cần chờ trip cập nhật
      const newDates = generateDatesArray(startDate, endDate);
      console.log('Generated new dates array:', newDates);
      setLocalDates(newDates);
      setIsDateConfirmed(true);
      setSelectedDates(null);
      
      message.success('Đã cập nhật thời gian chuyến đi');
    } else {
      console.log('No valid dates selected');
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      onChange({
        ...trip,
        startDate,
        endDate,
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...trip,
      name: e.target.value,
    });
  };

  const showAddDestinationModal = (date: string) => {
    setSelectedDate(date);
    setSelectedDestination(null);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedDate(null);
  };

  const handleAddDestination = () => {
    if (!selectedDate || !selectedDestination) return;

    // Tìm thông tin destination trước
    const selectedDestinationInfo = destinations.find(d => d.id === selectedDestination);
    if (!selectedDestinationInfo) {
      message.error('Không tìm thấy thông tin điểm đến');
      return;
    }

    // Lấy danh sách các items trong ngày đã chọn
    const items = trip.items.filter((item) => item.date === selectedDate);
    const newItem: TripItem = {
      id: generateItemId(),
      destinationId: selectedDestination,
      date: selectedDate,
      order: items.length > 0 ? Math.max(...items.map((item) => item.order)) + 1 : 0,
    };
    
    // Tạo một bản sao mới của trip với item mới
    const updatedTrip = {
      ...trip,
      items: [...trip.items, newItem],
    };
    
    // Log để debug
    console.log('Adding new destination:', selectedDestinationInfo.name);
    console.log('To date:', selectedDate);
    console.log('New item:', newItem);
    console.log('Updated trip items:', updatedTrip.items);
    
    // Gọi onChange để cập nhật state ở component cha
    onChange(updatedTrip);
    
    // Đóng modal
    setIsModalVisible(false);
    setSelectedDate(null);
    setSelectedDestination(null);
    
    // Hiển thị thông báo thành công với thông tin điểm đến
    message.success({
      content: `Đã thêm ${selectedDestinationInfo.name} vào lịch trình ngày ${moment(selectedDate).format('DD/MM/YYYY')}`,
      key: 'add-destination',
      duration: 3
    });
  };

  const handleDeleteItem = (itemId: string) => {
    onChange({
      ...trip,
      items: trip.items.filter((item) => item.id !== itemId),
    });
  };

  const handleMoveItem = (itemId: string, direction: 'up' | 'down') => {
    const item = trip.items.find((i) => i.id === itemId);
    if (!item) return;

    const itemsOnSameDay = trip.items
      .filter((i) => i.date === item.date)
      .sort((a, b) => a.order - b.order);

    const currentIndex = itemsOnSameDay.findIndex((i) => i.id === itemId);
    if (direction === 'up' && currentIndex <= 0) return;
    if (direction === 'down' && currentIndex >= itemsOnSameDay.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapItem = itemsOnSameDay[swapIndex];

    const updatedItems = trip.items.map((i) => {
      if (i.id === itemId) {
        return { ...i, order: swapItem.order };
      }
      if (i.id === swapItem.id) {
        return { ...i, order: item.order };
      }
      return i;
    });

    onChange({
      ...trip,
      items: updatedItems,
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const [sourceDate] = result.source.droppableId.split('-');
    const [destDate] = result.destination.droppableId.split('-');
    
    const sourceItems = trip.items
      .filter((item) => item.date === sourceDate)
      .sort((a, b) => a.order - b.order);
    
    const destItems = sourceDate === destDate 
      ? sourceItems 
      : trip.items
          .filter((item) => item.date === destDate)
          .sort((a, b) => a.order - b.order);
    
    const [draggedItem] = sourceItems.splice(result.source.index, 1);
    
    if (sourceDate === destDate) {
      sourceItems.splice(result.destination.index, 0, draggedItem);
      
      const updatedItems = trip.items.filter((item) => item.date !== sourceDate);
      
      sourceItems.forEach((item, index) => {
        updatedItems.push({
          ...item,
          order: index,
        });
      });
      
      onChange({
        ...trip,
        items: updatedItems,
      });
    } else {
      const updatedItems = trip.items.filter(
        (item) => item.date !== sourceDate && item.date !== destDate
      );
      
      sourceItems.forEach((item, index) => {
        updatedItems.push({
          ...item,
          order: index,
        });
      });
      
      destItems.splice(result.destination.index, 0, {
        ...draggedItem,
        date: destDate,
      });
      
      destItems.forEach((item, index) => {
        updatedItems.push({
          ...item,
          date: destDate,
          order: index,
        });
      });
      
      onChange({
        ...trip,
        items: updatedItems,
      });
    }
  };

  const handleResetDates = () => {
    console.log('Resetting dates');
    onChange({ ...trip, startDate: '', endDate: '' });
    setLocalDates([]);
    setIsDateConfirmed(false);
  };

  const renderTripDay = (date: string, index: number) => {
    const dayItems = getTripItemsByDate(trip, date);

    return (
      <TabPane
        tab={`Ngày ${index + 1}`}
        key={date}
      >
        <div className={styles.dayHeader}>
          <Text strong>{moment(date).format('DD/MM/YYYY')}</Text>
        </div>

        {dayItems.length === 0 ? (
          <Empty
            description="Chưa có điểm đến nào cho ngày này"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showAddDestinationModal(date)}
            >
              Thêm điểm đến
            </Button>
          </Empty>
        ) : (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`${date}-list`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {dayItems.map((item, itemIndex) => {
                      const destination = getDestinationById(destinations, item.destinationId);
                      if (!destination) return null;

                      const prevItem = itemIndex > 0 ? dayItems[itemIndex - 1] : null;
                      const showTravelTime = prevItem !== null;

                      return (
                        <React.Fragment key={item.id}>
                          {showTravelTime && (
                            <div className={styles.travelTime}>
                              <ClockCircleOutlined style={{ marginRight: 8 }} />
                              <Text type="secondary">
                                Di chuyển: {calculateTravelTime(prevItem!.destinationId, item.destinationId)} phút
                              </Text>
                            </div>
                          )}
                          <Draggable draggableId={item.id} index={itemIndex}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={styles.itineraryItem}
                              >
                                <Row gutter={16} align="middle">
                                  <Col xs={24} sm={20}>
                                    <Space align="start">
                                      <img
                                        src={destination.image}
                                        alt={destination.name}
                                        className={styles.imagePreview}
                                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                                      />
                                      <Space direction="vertical" size={4}>
                                        <Text strong className={styles.destinationName}>{destination.name}</Text>
                                        <Text className={styles.destinationPrice}>Giá: {formatCurrency(destination.price)}</Text>
                                        <Text className={styles.destinationDescription}>{destination.description}</Text>
                                      </Space>
                                    </Space>
                                  </Col>
                                  <Col xs={24} sm={4}>
                                    <Space direction="vertical" className={styles.actionButtons}>
                                      <Button
                                        icon={<ArrowUpOutlined />}
                                        size="small"
                                        onClick={() => handleMoveItem(item.id, 'up')}
                                        disabled={itemIndex === 0}
                                      />
                                      <Button
                                        icon={<ArrowDownOutlined />}
                                        size="small"
                                        onClick={() => handleMoveItem(item.id, 'down')}
                                        disabled={itemIndex === dayItems.length - 1}
                                      />
                                      <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                        onClick={() => handleDeleteItem(item.id)}
                                      />
                                    </Space>
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Draggable>
                        </React.Fragment>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => showAddDestinationModal(date)}
              >
                Thêm điểm đến
              </Button>
            </div>
          </>
        )}
      </TabPane>
    );
  };

  return (
    <div className={styles.tripContainer}>
      <Spin spinning={loading}>
        <Title level={4}>Lịch trình du lịch</Title>

        <Card size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Tên chuyến đi:</Text>
              <Input
                value={trip.name}
                onChange={handleNameChange}
                placeholder="Nhập tên chuyến đi"
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Thời gian:</Text>
              {!isDateConfirmed ? (
                <div style={{ marginTop: 8 }} className={styles.datePickerSection}>
                  <RangePicker
                    style={{ width: '100%' }}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                    placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                    value={selectedDates}
                  />
                  <Button 
                    type="primary" 
                    onClick={handleDateConfirm} 
                    disabled={!selectedDates || selectedDates.length !== 2}
                    style={{ marginTop: 8, width: '100%' }}
                    icon={<CheckCircleOutlined />}
                  >
                    Xác nhận lịch trình
                  </Button>
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Text>{moment(trip.startDate).format('DD/MM/YYYY')} - {moment(trip.endDate).format('DD/MM/YYYY')}</Text>
                    <Button type="link" onClick={handleResetDates} icon={<CalendarOutlined />}>
                      Thay đổi
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          </Space>
        </Card>

        {localDates.length > 0 ? (
          <Tabs defaultActiveKey={localDates[0]} tabPosition="left">
            {localDates.map((date, index) => renderTripDay(date, index))}
          </Tabs>
        ) : (
          <Empty 
            description="Vui lòng chọn thời gian cho chuyến đi" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>

      <Modal
        visible={isModalVisible}
        onOk={handleAddDestination}
        onCancel={handleModalCancel}
        width={800}
        title={<Typography.Title level={4} style={{ margin: 0 }}>Thêm điểm đến</Typography.Title>}
        okText="Thêm vào lịch trình"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedDestination }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>Chọn địa điểm cho ngày {selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : ''}:</Typography.Text>
          <Select
            showSearch
            placeholder="Tìm kiếm điểm đến..."
            style={{ width: '100%', marginTop: 8 }}
            onChange={(value) => setSelectedDestination(value as string)}
            value={selectedDestination}
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={destinations.map((destination) => ({
              value: destination.id,
              label: `${destination.name} - ${formatCurrency(destination.price)}`,
            }))}
          />
        </div>
        
        {selectedDestination && (
          <div style={{ marginTop: 16 }}>
            <Card className={styles.destinationDetailCard}>
              <Row gutter={16}>
                {(() => {
                  const destination = destinations.find((d) => d.id === selectedDestination);
                  if (!destination) return null;
                  
                  return (
                    <>
                      <Col xs={24} md={8}>
                        <img 
                          src={destination.image} 
                          alt={destination.name} 
                          className={styles.imagePreview}
                          style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8 }} 
                        />
                      </Col>
                      <Col xs={24} md={16}>
                        <div className={styles.destinationDetail}>
                          <Title level={4} className={styles.destinationName}>{destination.name}</Title>
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <Text><strong>Loại:</strong> {destination.type === 'beach' ? 'Biển' : destination.type === 'mountain' ? 'Núi' : 'Thành phố'}</Text>
                            <Text className={styles.destinationPrice}><strong>Giá:</strong> {formatCurrency(destination.price)}</Text>
                            <Text><strong>Đánh giá:</strong> {destination.rating}/5</Text>
                            <div className={styles.destinationDescription}>
                              <Text>{destination.description}</Text>
                            </div>
                          </Space>
                        </div>
                      </Col>
                    </>
                  );
                })()}
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TripItinerary; 