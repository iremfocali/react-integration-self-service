import React, { useState } from 'react';
import {
  Button,
  Modal,
  Drawer,
  Table,
  Form,
  Input,
  Row,
  Col,
  Card,
  Space,
  Alert,
  Typography,
  message,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SettingOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const DEFAULT_COOKIE_ID = 'BBCBCXGTSYQDFWEH20190821162806';

// Event şablonları ve default parametre açıklamaları
const eventTemplates: Record<string, Array<{ key: string; value: string; description: string; default: boolean; defaultValue: string }>> = {
  Login: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/giris', description: 'Requestin gönderileceği sayfa path\'i', default: true, defaultValue: '/giris' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.b_login', value: '1', description: 'Login işlemi için sabit', default: true, defaultValue: '1' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  CartView: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/cart', description: 'Sepet sayfası path\'i', default: true, defaultValue: '/cart' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.pbid', value: '159753', description: 'Sepet ID\'si', default: true, defaultValue: '159753' },
    { key: 'OM.pb', value: '774411', description: 'Sepete eklenen ürün ID\'si', default: true, defaultValue: '774411' },
    { key: 'OM.pu', value: '1', description: 'Sepete eklenen ürün sayısı', default: true, defaultValue: '1' },
    { key: 'OM.ppr', value: '199.99', description: 'Sepete eklenen ürün fiyatı', default: true, defaultValue: '199.99' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  Purchase: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/purchase', description: 'Satın alma sayfası path\'i', default: true, defaultValue: '/purchase' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.tid', value: 'A03K987', description: 'Sipariş numarası', default: true, defaultValue: 'A03K987' },
    { key: 'OM.pp', value: '774411', description: 'Satın alınan ürün ID\'si', default: true, defaultValue: '774411' },
    { key: 'OM.pu', value: '1', description: 'Satın alınan ürün sayısı', default: true, defaultValue: '1' },
    { key: 'OM.ppr', value: '199.99', description: 'Satın alınan ürün fiyatı', default: true, defaultValue: '199.99' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  SearchView: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/search', description: 'Arama sayfası path\'i', default: true, defaultValue: '/search' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.OSS', value: 'Kaban', description: 'Aranan kelime', default: true, defaultValue: 'Kaban' },
    { key: 'OM.OSSR', value: '5', description: 'Aranan kelime sonuç sayısı', default: true, defaultValue: '5' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  PageView: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/', description: 'Sayfa path\'i', default: true, defaultValue: '/' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  AddFav: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/fav', description: 'Favori ekleme path\'i', default: true, defaultValue: '/fav' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.pf', value: '774411', description: 'Favori eklenen ürün ID\'si', default: true, defaultValue: '774411' },
    { key: 'OM.pfu', value: '1', description: 'Favori eklenen ürün adedi', default: true, defaultValue: '1' },
    { key: 'OM.pfr', value: '199.99', description: 'Favori eklenen ürün fiyatı', default: true, defaultValue: '199.99' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  ProductView: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/product', description: 'Ürün sayfası path\'i', default: true, defaultValue: '/product' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.pv', value: '774411', description: 'Ürün ID\'si', default: true, defaultValue: '774411' },
    { key: 'OM.pn', value: 'Siyah Classic Kaban', description: 'Ürün adı', default: true, defaultValue: 'Siyah Classic Kaban' },
    { key: 'OM.ppr', value: '199.99', description: 'Ürün fiyatı', default: true, defaultValue: '199.99' },
    { key: 'OM.inv', value: '100', description: 'Ürün stok adedi', default: true, defaultValue: '100' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  SignUp: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/signup', description: 'Kayıt sayfası path\'i', default: true, defaultValue: '/signup' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.sgnp', value: '1', description: 'SignUp işlemi için sabit', default: true, defaultValue: '1' },  
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  CategoryView: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/category', description: 'Kategori sayfası path\'i', default: true, defaultValue: '/category' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.clist', value: '12', description: 'Kategori ID\'si', default: true, defaultValue: '12' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
  RemoveFav: [
    { key: 'cookieid', value: DEFAULT_COOKIE_ID, description: 'Zorunlu Cookie ID', default: true, defaultValue: DEFAULT_COOKIE_ID },
    { key: 'OM.uri', value: '/removefav', description: 'Favori kaldırma path\'i', default: true, defaultValue: '/removefav' },
    { key: 'OM.oid', value: 'PQ83VTYN49AB2KD', description: 'Visilabs Organizasyon id', default: true, defaultValue: 'PQ83VTYN49AB2KD' },
    { key: 'OM.pf', value: '774411', description: 'Favori kaldırılan ürün ID\'si', default: true, defaultValue: '774411' },
    { key: 'OM.pfu', value: '-1', description: 'Favori kaldırılan ürün adedi', default: true, defaultValue: '-1' },
    { key: 'OM.pfr', value: '199.99', description: 'Favori kaldırılan ürün fiyatı', default: true, defaultValue: '199.99' },
    { key: 'OM.siteID', value: 'K7F29LMX8AW3RZT', description: 'Visilabs Site id', default: true, defaultValue: 'K7F29LMX8AW3RZT' },
    { key: 'OM.exVisitorID', value: 'yusuf.bakirci@relateddigital.com', description: 'Kullanıcı Email/Key_ID bilgisi', default: true, defaultValue: 'yusuf.bakirci@relateddigital.com' },
  ],
};

const defaultEvents = Object.keys(eventTemplates);

const eventDescriptions: Record<string, string> = {
  Login: 'Kayıtlı olan üye giriş yaptığı zaman çalışır.',
  CartView: 'Kullanıcı sepetini görüntülediğinde çalışır.',
  Purchase: 'Kullanıcı bir satın alma işlemi gerçekleştirdiğinde çalışır.',
  SearchView: 'Kullanıcı bir arama yaptığında çalışır.',
  PageView: 'Kullanıcı herhangi bir sayfayı görüntülediğinde çalışır.',
  AddFav: 'Kullanıcı bir ürünü favorilerine eklediğinde çalışır.',
  ProductView: 'Kullanıcı bir ürün detay sayfasını görüntülediğinde çalışır.',
  SignUp: 'Kullanıcı yeni bir üyelik oluşturduğunda çalışır.',
  CategoryView: 'Kullanıcı bir kategori sayfasını görüntülediğinde çalışır.',
  RemoveFav: 'Kullanıcı bir ürünü favorilerinden kaldırdığında çalışır.',
};

const VISILABS_BASE = 'http://ssrlgr.visilabs.net/Logging.svc/SendRequest/2F46336C6A3036533961343D';

export default function EventRequestBuilder() {
  const [eventList, setEventList] = useState<string[]>([...defaultEvents]);
  const [eventParams, setEventParams] = useState<Record<string, Array<{ key: string; value: string; description?: string; default?: boolean; defaultValue?: string }>>>(
    { ...eventTemplates }
  );
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [requestUrl, setRequestUrl] = useState('');
  const [result, setResult] = useState<{ status: number; data: any } | { error: string } | null>(null);
  const [customEventName, setCustomEventName] = useState('');
  const [userDomain, setUserDomain] = useState('');

  // Event kartına tıklayınca modal aç
  const openEventModal = (eventName: string) => {
    setSelectedEvent(eventName);
    setModalOpen(true);
  };
  const closeEventModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setResult(null);
    setRequestUrl('');
  };

  // Parametre ekle/düzenle
  const showDrawer = (index: number | null = null) => {
    setEditIndex(index);
    if (selectedEvent) {
      if (index !== null) {
        form.setFieldsValue(eventParams[selectedEvent][index]);
      } else {
        form.resetFields();
      }
      setDrawerOpen(true);
    }
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditIndex(null);
  };
  const handleDrawerOk = () => {
    form.validateFields().then((values: any) => {
      if (!selectedEvent) return;
      let newParams = [...eventParams[selectedEvent]];
      if (editIndex !== null) {
        // default parametre ise sadece value ve description güncellenebilir
        if (newParams[editIndex].default) {
          newParams[editIndex] = {
            ...newParams[editIndex],
            value: values.value,
            description: values.description
          };
        } else {
          newParams[editIndex] = values;
        }
      } else {
        newParams.push({ ...values, default: false });
      }
      setEventParams({ ...eventParams, [selectedEvent]: newParams });
      setDrawerOpen(false);
      setEditIndex(null);
    });
  };
  const handleDelete = (index: number) => {
    if (!selectedEvent) return;
    if (eventParams[selectedEvent][index].default) return; // default parametre silinemez
    setEventParams({
      ...eventParams,
      [selectedEvent]: eventParams[selectedEvent].filter((_, i) => i !== index)
    });
  };

  // Custom event ekle
  const handleAddCustomEvent = () => {
    if (customEventName && !eventList.includes(customEventName)) {
      setEventList([...eventList, customEventName]);
      setEventParams({ ...eventParams, [customEventName]: [] });
      message.success('Yeni event eklendi!');
      setCustomEventName('');
    }
  };

  // Event silme fonksiyonu (sadece custom eventler için)
  const handleDeleteEvent = (eventName: string) => {
    if (defaultEvents.includes(eventName)) return;
    setEventList(eventList.filter(ev => ev !== eventName));
    const newParams = { ...eventParams };
    delete newParams[eventName];
    setEventParams(newParams);
  };

  // Request URL oluştur
  const buildRequestUrl = () => {
    if (!userDomain || !selectedEvent) return '';
    const params = eventParams[selectedEvent] || [];
    const cookieParam = params.find(p => p.key === 'cookieid');
    const otherParams = params.filter(p => p.key !== 'cookieid');
    const paramStr = otherParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    const cleanDomain = userDomain.replace(/\/+$/, '');
    return `${VISILABS_BASE}/${cleanDomain}/${cookieParam?.value || ''}${paramStr ? '?' + paramStr : ''}`;
  };

  // API'ye gönder
  const sendRequest = async () => {
    const url = buildRequestUrl();
    setRequestUrl(url);
    try {
      const response = await fetch(`http://localhost:5004/serverside-request?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
  };

  // Tablo kolonları
  const columns = [
    { title: 'Parametre', dataIndex: 'key', key: 'key', render: (text: string, record: any) => record.default ? <b>{text}</b> : text },
    { title: 'Değer', dataIndex: 'value', key: 'value', render: (text: string, record: any) => record.default ? <b>{text}</b> : text },
    { title: 'Açıklama', dataIndex: 'description', key: 'description', render: (text: string, record: any) => <Text type={record.default ? 'success' : 'secondary'}>{text}</Text> },
    {
      title: 'İşlem',
      key: 'action',
      render: (_: any, record: any, index: number) => (
        <Space>
          <Tooltip title={record.default ? 'Default parametre, sadece düzenlenebilir' : 'Düzenle'}>
            <Button icon={<EditOutlined />} size="small" onClick={() => showDrawer(index)} />
          </Tooltip>
          {!record.default && (
            <Tooltip title="Sil">
              <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(index)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f6f8fa', minHeight: '100vh' }}>
      <Title level={3} style={{ marginBottom: 0 }}>Event Request Oluşturucu</Title>
      <Paragraph style={{ marginBottom: 24 }}>Eventler arasından seçim yapın veya yeni bir event ekleyin. Detaylar için karta tıklayın.</Paragraph>
      <Form layout="inline" style={{ marginBottom: 24 }}>
        <Form.Item label="Domain" required>
          <Input
            style={{ minWidth: 300 }}
            placeholder="Domain giriniz (örn: www.example.com.tr)"
            value={userDomain}
            onChange={e => setUserDomain(e.target.value)}
          />
        </Form.Item>
      </Form>
      <Row gutter={[24, 24]}>
        {eventList.map(ev => (
          <Col key={ev} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={<span><UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />{ev}
                {!defaultEvents.includes(ev) && (
                  <CloseCircleOutlined
                    style={{ color: '#ff4d4f', float: 'right', fontSize: 18, cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); handleDeleteEvent(ev); }}
                    title="Eventi Sil"
                  />
                )}
              </span>}
              hoverable
              onClick={() => openEventModal(ev)}
              style={{ minHeight: 140, borderRadius: 12, boxShadow: '0 2px 8px #e6f7ff', border: '1px solid #e6f7ff', background: '#fff' }}
              bodyStyle={{ padding: 18 }}
            >
              <p style={{ color: '#888', fontSize: 13 }}>{eventDescriptions[ev]}</p>
            </Card>
          </Col>
        ))}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{ minHeight: 140, textAlign: 'center', color: '#1890ff', border: '1px dashed #1890ff', borderRadius: 12, background: '#f0f5ff' }}
            bodyStyle={{ padding: 18 }}
            onClick={handleAddCustomEvent}
          >
            <Input
              style={{ marginBottom: 8 }}
              placeholder="Yeni event adı"
              value={customEventName}
              onChange={e => setCustomEventName(e.target.value)}
              onPressEnter={handleAddCustomEvent}
            />
            <PlusOutlined /> Yeni Event Ekle
          </Card>
        </Col>
      </Row>
      <Modal
        open={modalOpen}
        onCancel={closeEventModal}
        title={selectedEvent ? <span><SettingOutlined style={{ color: '#1890ff', marginRight: 8 }} />{selectedEvent} Detayları</span> : ''}
        width={800}
        footer={null}
        destroyOnClose
        style={{ top: 40 }}
        bodyStyle={{ background: '#f6f8fa', borderRadius: 12 }}
      >
        {selectedEvent && (
          <>
            <Table
              dataSource={eventParams[selectedEvent].map((p) => ({ ...p, key: p.key }))}
              columns={columns}
              pagination={false}
              style={{ marginBottom: 16, background: '#fff', borderRadius: 8 }}
              rowClassName={record => record.default ? 'default-param-row' : ''}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showDrawer(null)}>
                Parametre Ekle
              </Button>
              <Button type="primary" onClick={sendRequest} disabled={!userDomain} style={{ minWidth: 160, fontWeight: 600 }}>
                Request'i Gönder
              </Button>
            </div>
            <div style={{ margin: '24px 0' }}>
              <Title level={5}>Oluşan Request URL</Title>
              <Paragraph copyable style={{ background: '#fff', padding: 12, borderRadius: 6 }}>{buildRequestUrl()}</Paragraph>
            </div>
            {result && (
              <Alert
                message={'error' in result ? 'Hata' : 'Başarılı'}
                description={'error' in result ? result.error : JSON.stringify(result, null, 2)}
                type={'error' in result ? 'error' : 'success'}
                showIcon
              />
            )}
          </>
        )}
        <Drawer
          title={editIndex !== null && eventParams[selectedEvent || '']?.[editIndex]?.default ? 'Default Parametreyi Düzenle' : 'Parametre Ekle'}
          width={360}
          onClose={handleDrawerClose}
          open={drawerOpen}
          bodyStyle={{ paddingBottom: 80 }}
          destroyOnClose
        >
          <Form layout="vertical" form={form} initialValues={{ key: '', value: '', description: '' }}>
            <Form.Item
              name="key"
              label="Parametre"
              rules={[{ required: true, message: 'Parametre anahtarı gerekli' }]}
            >
              <Input placeholder="OM.uri, OM.oid, ..." disabled={editIndex !== null && eventParams[selectedEvent || '']?.[editIndex]?.default} />
            </Form.Item>
            <Form.Item
              name="value"
              label="Değer"
              rules={[{ required: true, message: 'Parametre değeri gerekli' }]}
            >
              <Input placeholder="Değer giriniz" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Açıklama (opsiyonel)"
            >
              <Input.TextArea placeholder="Açıklama giriniz (opsiyonel)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleDrawerOk} style={{ marginRight: 8 }}>
                Kaydet
              </Button>
              <Button onClick={handleDrawerClose}>İptal</Button>
            </Form.Item>
          </Form>
        </Drawer>
      </Modal>
      {/* CSS for default param row */}
      <style>{`
        .default-param-row td {
          background: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
} 