export const BasicToastCode = `   
<Toast>
    <Toast.Header>
        <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
        <strong className="me-auto">Bootstrap</strong>
        <small>11 mins ago</small>
    </Toast.Header>
    <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
</Toast>
`.trim();

export const LiveToastCode = `   
<Toast>
    <Toast.Header>
        <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
        <strong className="me-auto">Bootstrap</strong>
        <small>just now</small>
    </Toast.Header>
    <Toast.Body>See? Just like this.</Toast.Body>
</Toast>
`.trim();

export const DismissibleToastCode = `   
<Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
    <Toast.Header>
        <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
        <strong className="me-auto">Bootstrap</strong>
        <small>11 mins ago</small>
    </Toast.Header>
    <Toast.Body>Woohoo, you're reading this text in a Toast!</Toast.Body>
</Toast>
`.trim();

export const PlacementCode = `   
<div aria-live="polite" aria-atomic="true" className="bg-dark position-relative" style={{ minHeight: '240px' }}>
    <Toast>
        <Toast.Header>
            <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
            <strong className="me-auto">Bootstrap</strong>
            <small>11 mins ago</small>
        </Toast.Header>
        <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
    </Toast>
</div>
`.trim();

export const PlacementCode2 = `   
<div aria-live="polite" aria-atomic="true" style={{ position: 'relative', minHeight: '200px' }}>
    <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <Toast>
            <Toast.Header>
                <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
                <strong className="me-auto">Bootstrap</strong>
                <small>just now</small>
            </Toast.Header>
            <Toast.Body>See? Just like this.</Toast.Body>
        </Toast>
        <Toast>
            <Toast.Header>
                <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
                <strong className="me-auto">Bootstrap</strong>
                <small>2 seconds ago</small>
            </Toast.Header>
            <Toast.Body>Heads up, toasts will stack automatically</Toast.Body>
        </Toast>
    </div>
</div>
`.trim();

export const PlacementCode3 = `   
<div aria-live="polite" aria-atomic="true" className="d-flex justify-content-center align-items-center" 
    style={{
        position: 'relative',
        minHeight: '250px',
    }}>
    <Toast>
        <Toast.Header>
            <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
            <strong className="me-auto">Bootstrap</strong>
            <small>11 mins ago</small>
        </Toast.Header>
        <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
    </Toast>
</div>
`.trim();

export const CustomToastCode = `   
<div>
    <Toast>
        <Toast.Header>
            <Image src="https://placehold.co/20x20/754FFE/754FFE" className="rounded me-2" alt="" />
            <strong className="me-auto">Bootstrap</strong>
            <small>11 mins ago</small>
        </Toast.Header>
        <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
    </Toast>
</div>
`.trim();

export const ToastsCode = [BasicToastCode, LiveToastCode, DismissibleToastCode, PlacementCode, PlacementCode2, PlacementCode3, CustomToastCode];

export default ToastsCode;
