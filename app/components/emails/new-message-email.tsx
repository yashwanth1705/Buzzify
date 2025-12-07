import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
    Hr,
} from '@react-email/components';

interface NewMessageEmailProps {
    title: string;
    senderName: string;
    priority: string;
    previewText: string;
    link: string;
}

export const NewMessageEmail = ({
    title,
    senderName,
    priority,
    previewText,
    link,
}: NewMessageEmailProps) => {
    const preview = `New ${priority} priority message from ${senderName}: ${title}`;

    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            New Campus Message
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            You have a new message from <strong>{senderName}</strong>.
                        </Text>

                        <Section className="my-[24px] p-[20px] rounded bg-gray-50 border border-gray-100">
                            <Text className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                                {priority} Priority
                            </Text>
                            <Heading as="h2" className="text-[20px] font-bold mt-0 mb-4 text-gray-800">
                                {title}
                            </Heading>
                            <Text className="text-gray-600 text-[14px]">
                                {previewText}...
                            </Text>
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-indigo-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={link}
                            >
                                View Full Message
                            </Link>
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This notification was sent from your Campus Messaging Portal.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default NewMessageEmail;
