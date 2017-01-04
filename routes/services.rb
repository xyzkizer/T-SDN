class ServiceController < SDN

  get '/' do
    content_type :json

    services = {}
    services[:data] = []
    JSON.parse($redis.get(%Q(#{$redis.get("root-topolopy")}.connService))).each do |uuid|
      services[:data] << JSON.parse($redis.get(uuid))
    end
    services[:count] = services[:data].length

    services.to_json
  end
end
