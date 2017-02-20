class LinkController < SDN

  get '/' do
    content_type :json
    links = {}
    links[:data] = []
    JSON.parse($redis.get($redis.get('root-topology')))['_linkRefList'].each do |uuid|
      links[:data] << JSON.parse($redis.get(uuid))
    end
    links[:count] = links[:data].length

    links.to_json
  end
end
