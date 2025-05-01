/* eslint-disable @typescript-eslint/no-unused-vars */
// import node module libraries
import { useState, useEffect } from "react";
import {
	Container,
	Row,
	Col,
	Card,
	Button,
	Offcanvas,
	Badge,
	Accordion,
	Table,
	InputGroup,
} from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

import SampleGTMExport from "../../data/JSONFiles/SampleGTMExport.json";

interface GTMExport {
	exportFormatVersion: number;
	exportTime: string;
	containerVersion: {
		path: string;
		accountId: string;
		containerId: string;
		containerVersionId: string;
		container: {
			path: string;
			accountId: string;
			containerId: string;
			name: string;
			publicId: string;
			usageContext: string[];
			fingerprint: string;
			tagManagerUrl: string;
			features: {
				[key: string]: boolean;
			};
			tagIds: string[];
		};
		tagManagerUrl: string;
		tag: GTMTags[];
		trigger: GTMTags[];
		variable: GTMTags[];
		builtInVariable: GTMTags[];
	};
}
interface GTMTags {
	accountId: string;
	containerId: string;
	tagId: string;
	name: string;
	type: string;
	parameter: Array<{
		type: string;
		key: string;
		value: string;
	}>;
	fingerprint: string;
	firingTriggerId: string[];
	tagFiringOption: string;
	monitoringMetadata: {
		type: string;
	};
	consentSettings: {
		consentStatus: string;
	};
}

interface GTMTriggers {
	name: string;
	type: string;
	triggerId: string;
	accountId: string;
	containerId: string;
	fingerprint: string;
	filter: Array<{
		type: string;
		parameter: Array<{
			type: string;
			key: string;
			value: string;
		}>;
	}>;
	customEventFilter: Array<{
		type: string;
		parameter: Array<{
			type: string;
			key: string;
			value: string;
		}>;
	}>;
}

interface GTMVariables {
	name: string;
	type: string;
	fingerprint: string;
	accountId: string;
	parameter: Array<{
		type: string;
		key: string;
		value: string;
	}>;
}

interface GTMBuiltInVariables {
	accountId: string;
	containerId: string;
	name: string;
	type: string;
}

const EventGTM = () => {
	const sid = "756B5036644F706C4F6A4D3D";
	const oid = "504E6F37515941744B34633D";
	// State for controlling the offcanvas
	const [showOffcanvas, setShowOffcanvas] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<GTMTags | null>(null);
	const [offcanvasWidth, setOffcanvasWidth] = useState("40%");

	// Update offcanvas width based on screen size
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setOffcanvasWidth("100%");
			} else if (window.innerWidth < 992) {
				setOffcanvasWidth("70%");
			} else {
				setOffcanvasWidth("40%");
			}
		};

		// Set initial width
		handleResize();

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Cleanup event listener
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleShowCode = (event: GTMTags) => {
		setSelectedEvent(event);
		setShowOffcanvas(true);
	};

	const handleCloseOffcanvas = () => {
		setShowOffcanvas(false);
	};

	const renderEventCard = (event: GTMTags) => {
		return (
			<Col
				key={event.tagId}
				xs={16}
				md={12}
				lg={8}
				xl={6}
				className='mb-3'>
				<Card className='h-100 shadow-sm'>
					<Card.Body>
						<Row>
							<Card.Title className='d-flex justify-content-between align-items-center flex-wrap'>
								<span className='me-2 text-truncate'>{event.name}</span>
								<div className='d-flex gap-2 flex-wrap mt-2 mt-sm-0'>
									{/* <Button size='sm' variant='primary'>
                  <i className='fe fe-plus me-1 d-none d-sm-inline'></i>Add
                </Button> */}
									<Button
										size='sm'
										variant='danger'>
										<i className='fe fe-trash-2 me-1 d-none d-sm-inline'></i>
										Remove
									</Button>

									<Button
										size='sm'
										variant='outline-info'
										onClick={() => handleShowCode(event)}>
										<i className='fe fe-code me-1 d-none d-sm-inline'></i>Code
									</Button>
								</div>
							</Card.Title>
						</Row>
						<Row>
							<Col className='relative inline-block'>
								<InputGroup className='my-2'>
									<input
										type='text'
										className='form-control'
										placeholder='Link for the event page'
									/>
									<Button
										size='sm'
										variant='outline-info'>
										<i className='fe fe-link me-1 d-none d-sm-inline'></i>Visit
									</Button>
								</InputGroup>
							</Col>
						</Row>
						{event.firingTriggerId.map((triggerId) =>
							renderTriggerAccordion(triggerId)
						)}
						<Row>
							<Col>
								<>{renderVariablesAccordion(event)}</>
							</Col>
						</Row>
					</Card.Body>
				</Card>
			</Col>
		);
	};

	const renderTriggerAccordion = (triggerId: string) => {
		const trigger = SampleGTMExport.containerVersion.trigger.find(
			(trigger) => trigger.triggerId === triggerId
		);
		return (
			<Accordion
				className='mb-2'
				key={triggerId}>
				<Accordion.Item eventKey={triggerId}>
					<Accordion.Header>Trigger for this event</Accordion.Header>
					<Accordion.Body>
						<Row>
							<Table
								size='sm'
								bordered
								hover>
								<tbody>
									<tr>
										<td>Event Name</td>
										<td>{trigger?.customEventFilter?.[0]?.type}</td>
										<td>
											{trigger?.customEventFilter?.[0]?.parameter[1].value}
										</td>
									</tr>
									<tr>
										<td>Label Variable</td>
										<td> {trigger?.filter?.[0]?.type}</td>
										<td>{trigger?.filter?.[0]?.parameter[1].value}</td>
									</tr>
								</tbody>
							</Table>
							<Button
								size='sm'
								variant='secondary'>
								<i className='fe fe-plus me-1 d-none d-sm-inline'></i>Add
								Trigger
							</Button>
						</Row>
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
		);
	};
	// Type assertion for the imported JSON

	const renderVariablesAccordion = (eventCode: GTMTags) => {
		const { templateVariables, omParameters } = findVariables(
			eventCode.parameter[0].value
		);

		return (
			<Accordion>
				<Accordion.Item eventKey={eventCode.tagId}>
					<Accordion.Header>Variables for this event</Accordion.Header>
					<Accordion.Body>
						<div className='d-flex flex-wrap gap-2'>
							{templateVariables.map((variable: string, i: number) => (
								<span
									className='font-size-12'
									key={`tpl-${i}`}>
									{variable}
									{i < templateVariables.length - 1 ? ", " : ""}
								</span>
							))}
							{omParameters.map((param: string, i: number) => (
								<span
									className='font-size-12'
									key={`om-${i}`}>
									OM.{param}
									{i < omParameters.length - 1 ? ", " : ""}
								</span>
							))}
						</div>
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
		);
	};

	function findVariables(code: string) {
		const templateVars =
			code
				.match(/{{\s*([^}]+)\s*}}/g)
				?.map((v) => v.replace(/[{}]/g, "").trim()) || [];
		const filteredTemplateVars = templateVars.filter(
			(v) => !["RMC-sid", "RMC-oid"].includes(v)
		);

		// Try multiple patterns to capture OM parameters
		const omParams = [
			...code.matchAll(/vl\.AddParameter\("OM\.([^"]+)"/g),
			...code.matchAll(/vl\.AddParameter\('OM\.([^']+)'/g),
			...code.matchAll(/OM\.([^"'\s,)]+)/g),
		].map((m) => m[1]);

		const filteredOmParams = omParams.filter(
			(p) =>
				![
					"VLEventException",
					"VLEventExceptionName",
					"VLControlEventExceptionName",
					"VLControlEventException",
				].includes(p) &&
				p &&
				p.trim() !== ""
		);

		return {
			templateVariables: filteredTemplateVars,
			omParameters: filteredOmParams,
		};
	}

	return (
		<Container
			fluid
			className='p-6'>
			<PageHeading heading='Event Integration' />
			<Row>
				<Col
					lg={12}
					md={12}
					sm={12}>
					<Card>
						<Card.Header>
							<h4 className='mb-0'>GTM Integration Settings</h4>
						</Card.Header>
						<Card.Body>
							<p className='mb-0'>
								Configure your event integration settings here. This allows you
								to track and manage events in your application.
							</p>
							<p className='mb-0'>
								<a
									href={
										"https://relateddigital.atlassian.net/wiki/spaces/RMCKBT/pages/2163507226/Web+DataLayer+Event+ablonu+Entegrasyonu"
									}
									target='_blank'
									rel='noopener noreferrer'>
									Please see first steps for this integration type here.
								</a>
							</p>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row>
				<Col
					lg={12}
					md={12}
					sm={12}>
					<Card className='mt-4'>
						<Card.Header>
							<h4 className='mb-0'>GTM Integration Data</h4>
						</Card.Header>
						<Card.Body>
							<Row>
								{SampleGTMExport.containerVersion.tag &&
									SampleGTMExport.containerVersion.tag
										.filter(
											(event) => event.name !== "RMC - ControlEventRequest"
										)
										.map((event) => renderEventCard(event))}
							</Row>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Offcanvas for displaying code */}
			<Offcanvas
				show={showOffcanvas}
				onHide={handleCloseOffcanvas}
				placement='end'
				style={{ width: offcanvasWidth }}>
				<Offcanvas.Header closeButton>
					<div className='d-flex align-items-center flex-wrap'>
						<Offcanvas.Title>{selectedEvent?.name} - Code</Offcanvas.Title>
						<Badge
							pill
							bg='light'
							text='dark'
							className='mx-2'>
							Read-only
						</Badge>
					</div>
				</Offcanvas.Header>
				<Offcanvas.Body>
					{selectedEvent && (
						<pre
							className='p-3 bg-light rounded'
							style={{ overflowY: "auto", whiteSpace: "pre-wrap" }}>
							{selectedEvent.parameter[0].value}
						</pre>
					)}
				</Offcanvas.Body>
			</Offcanvas>
		</Container>
	);
};

export default EventGTM;
