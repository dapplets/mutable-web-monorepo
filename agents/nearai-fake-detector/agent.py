from nearai.agents.environment import Environment


def run(env: Environment):
    message_text = env.list_messages()[0]["content"]

    # Your agent code here
    prompts = [
        {
            "role": "system",
            "content": "Answer only in structured json. "
            "{ "
            '"context": { '
            '"namespace": "dapplets.near/agent/nearai-fake-detector", '
            '"contextType": "similarity", '
            '"id": "<same as input id>", '
            '"parsedContext": { '
            '"score": <numerical value>, '
            '"explanation": "<justification text>" '
            "} "
            "} "
            "}"
            "Evaluate the following text and determine how similar it is to "
            "fake or misleading content. Provide a score between 0 and 1, where 0 means not at all similar and 1 means extremely similar. "
            "Then provide a justification for the score. ",
        },
        {"role": "user", "content": message_text},
    ]

    result = env.completion(prompts)
    env.add_reply(result)
    env.request_user_input()


run(env)
